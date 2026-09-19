import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { config } from './config.js';
import { testGeminiConnection } from './services/geminiService.js';
import { AgentOrchestrator } from './agent/orchestrator.js';
import { getAllTasks, getTaskById, deleteTask } from './storage/taskStore.js';
import { getAllWorkflows, saveWorkflow, deleteWorkflow } from './storage/workflowStore.js';
import { getMemory, updateMemory } from './storage/memoryStore.js';
import { getPermissions, updatePermissions } from './security/permissionManager.js';

const app = express();

app.use(cors());
app.use(express.json());

// Serve saved screenshots statically
const screenshotsDir = path.resolve('screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}
app.use('/screenshots', express.static(screenshotsDir));

// Active orchestrator instances registry
const activeOrchestrators = new Map();
// SSE client connections registry
const sseClients = new Map();

function broadcastToTaskClients(taskId, eventType, data) {
  const clients = sseClients.get(taskId) || [];
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((res) => {
    try {
      res.write(payload);
    } catch {}
  });
}

// 1. Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. Test Gemini API
app.get('/api/test-gemini', async (req, res) => {
  try {
    const result = await testGeminiConnection();
    res.json(result);
  } catch (error) {
    const status =
      error.originalStatus &&
      Number.isInteger(error.originalStatus) &&
      error.originalStatus >= 400 &&
      error.originalStatus < 600
        ? error.originalStatus
        : 500;

    res.status(status).json({
      success: false,
      error: error.message,
    });
  }
});

// 3. Start Task Asynchronously (for UI & SSE streaming)
app.post('/api/agent/start', async (req, res) => {
  const { task: prompt, headless = false, maxIterations = 10 } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing required field "task".' });
  }

  const orchestrator = new AgentOrchestrator({ headless, maxIterations });

  // Hook orchestrator events to SSE broadcasting
  orchestrator.on('status', (data) => broadcastToTaskClients(orchestrator.taskId, 'status', data));
  orchestrator.on('interpreted', (data) => broadcastToTaskClients(orchestrator.taskId, 'interpreted', data));
  orchestrator.on('planGenerated', (data) => broadcastToTaskClients(orchestrator.taskId, 'planGenerated', data));
  orchestrator.on('clarificationRequired', (data) => broadcastToTaskClients(orchestrator.taskId, 'clarificationRequired', data));
  orchestrator.on('stepExecuted', (data) => broadcastToTaskClients(orchestrator.taskId, 'stepExecuted', data));
  orchestrator.on('screenshotCaptured', (data) => broadcastToTaskClients(orchestrator.taskId, 'screenshotCaptured', data));
  orchestrator.on('confirmationRequired', (data) => broadcastToTaskClients(orchestrator.taskId, 'confirmationRequired', data));
  orchestrator.on('taskCompleted', (data) => broadcastToTaskClients(orchestrator.taskId, 'taskCompleted', data));
  orchestrator.on('taskFailed', (data) => broadcastToTaskClients(orchestrator.taskId, 'taskFailed', { error: data.message || data }));

  // Kick off task in background
  const executionPromise = orchestrator.executeTask(prompt);
  const taskId = orchestrator.taskId;
  activeOrchestrators.set(taskId, orchestrator);

  executionPromise.finally(() => {
    activeOrchestrators.delete(taskId);
  });

  res.json({
    success: true,
    taskId,
    status: 'ANALYZING',
  });
});

// 4. Run Task Synchronously (CLI / Simple REST)
app.post('/api/agent/run', async (req, res) => {
  const { task: prompt, headless = true, maxIterations = 8 } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing required field "task".' });
  }

  const orchestrator = new AgentOrchestrator({ headless, maxIterations });
  try {
    const taskRecord = await orchestrator.executeTask(prompt);
    res.json({
      success: true,
      summary: taskRecord.finalResult?.summary,
      steps: taskRecord.steps,
      finalScreenshot: taskRecord.screenshots?.[taskRecord.screenshots.length - 1]?.path,
      taskRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || String(error),
    });
  }
});

// 5. Server-Sent Events (SSE) Stream for a Task
app.get('/api/agent/stream/:taskId', (req, res) => {
  const { taskId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!sseClients.has(taskId)) {
    sseClients.set(taskId, []);
  }
  sseClients.get(taskId).push(res);

  // Send current task snapshot immediately
  const task = getTaskById(taskId);
  if (task) {
    res.write(`event: snapshot\ndata: ${JSON.stringify(task)}\n\n`);
  }

  req.on('close', () => {
    const clients = sseClients.get(taskId) || [];
    sseClients.set(
      taskId,
      clients.filter((client) => client !== res)
    );
  });
});

// 6. Interactive Task Controls (Pause, Resume, Takeover, Stop, Confirm)
app.post('/api/agent/pause', (req, res) => {
  const { taskId } = req.body;
  const orch = activeOrchestrators.get(taskId);
  if (orch) {
    orch.pause();
    return res.json({ success: true, status: 'PAUSED' });
  }
  res.status(404).json({ success: false, error: 'Active task not found.' });
});

app.post('/api/agent/resume', (req, res) => {
  const { taskId } = req.body;
  const orch = activeOrchestrators.get(taskId);
  if (orch) {
    orch.resume();
    return res.json({ success: true, status: 'RUNNING' });
  }
  res.status(404).json({ success: false, error: 'Active task not found.' });
});

app.post('/api/agent/takeover', (req, res) => {
  const { taskId } = req.body;
  const orch = activeOrchestrators.get(taskId);
  if (orch) {
    orch.takeControl();
    return res.json({ success: true, status: 'HUMAN_TAKEOVER' });
  }
  res.status(404).json({ success: false, error: 'Active task not found.' });
});

app.post('/api/agent/stop', (req, res) => {
  const { taskId } = req.body;
  const orch = activeOrchestrators.get(taskId);
  if (orch) {
    orch.stop();
    return res.json({ success: true, status: 'STOPPED' });
  }
  res.status(404).json({ success: false, error: 'Active task not found.' });
});

app.post('/api/agent/confirm', (req, res) => {
  const { taskId, approved } = req.body;
  const orch = activeOrchestrators.get(taskId);
  if (orch) {
    orch.resolveConfirmation(Boolean(approved));
    return res.json({ success: true });
  }
  res.status(404).json({ success: false, error: 'Active task not found.' });
});

app.post('/api/agent/clarify', (req, res) => {
  const { taskId, answers } = req.body;
  const orch = activeOrchestrators.get(taskId);
  if (orch) {
    orch.resolveClarification(answers || {});
    return res.json({ success: true });
  }
  res.status(404).json({ success: false, error: 'Active task not found.' });
});

// 7. Task History CRUD
app.get('/api/tasks', (req, res) => {
  res.json({ tasks: getAllTasks() });
});

app.get('/api/tasks/:id', (req, res) => {
  const task = getTaskById(req.params.id);
  if (task) return res.json(task);
  res.status(404).json({ error: 'Task not found' });
});

app.delete('/api/tasks/:id', (req, res) => {
  deleteTask(req.params.id);
  res.json({ success: true });
});

// 8. Workflows CRUD
app.get('/api/workflows', (req, res) => {
  res.json({ workflows: getAllWorkflows() });
});

app.post('/api/workflows', (req, res) => {
  const wf = saveWorkflow(req.body);
  res.json(wf);
});

app.delete('/api/workflows/:id', (req, res) => {
  deleteWorkflow(req.params.id);
  res.json({ success: true });
});

// 9. Memory & Preferences
app.get('/api/memory', (req, res) => {
  res.json(getMemory());
});

app.post('/api/memory', (req, res) => {
  res.json(updateMemory(req.body));
});

// 10. Permissions
app.get('/api/permissions', (req, res) => {
  res.json(getPermissions());
});

app.post('/api/permissions', (req, res) => {
  res.json(updatePermissions(req.body));
});

// Serve compiled React frontend if built
const frontendDist = path.resolve('frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/screenshots')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Start server if executed directly
const currentFile = fileURLToPath(import.meta.url);
const executedFile = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (executedFile && currentFile === executedFile) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Browser Control Agent API Server running on port ${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/health`);
    console.log(`Agent API:    http://localhost:${PORT}/api/agent/run`);
    console.log(`SSE Stream:   http://localhost:${PORT}/api/agent/stream/:taskId`);
    console.log(`====================================================`);
  });
}

export default app;
