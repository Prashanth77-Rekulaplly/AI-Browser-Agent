import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { CommandBox } from './components/CommandBox';
import { PlanViewer } from './components/PlanViewer';
import { LiveActivityTimeline } from './components/LiveActivityTimeline';
import { ScreenshotGallery } from './components/ScreenshotGallery';
import { ConfirmationModal } from './components/ConfirmationModal';
import { TakeoverBanner } from './components/TakeoverBanner';
import { SourcePanel } from './components/SourcePanel';
import { ClarificationPanel } from './components/ClarificationPanel';
import { FinalResultView } from './components/FinalResultView';
import { TasksHistoryView } from './components/TasksHistoryView';
import { WorkflowsView } from './components/WorkflowsView';
import { MemoryView } from './components/MemoryView';
import { PermissionsView } from './components/PermissionsView';
import { SettingsView } from './components/SettingsView';
import { useTheme } from './hooks/useTheme';
import { TaskRecord, TaskStatus, WorkflowItem, MemorySettings, PermissionSettings } from './types';

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>('new-task');
  const [activeTask, setActiveTask] = useState<TaskRecord | null>(null);
  const [tasksList, setTasksList] = useState<TaskRecord[]>([]);
  const [workflowsList, setWorkflowsList] = useState<WorkflowItem[]>([]);
  const [memory, setMemory] = useState<MemorySettings>({
    preferences: {
      preferredLanguage: 'English',
      preferredCurrency: 'INR',
      researchDepth: 'detailed',
      defaultSearchEngine: 'Google',
      headlessMode: false,
    },
    customRules: [],
  });
  const [permissions, setPermissions] = useState<PermissionSettings>({});
  const [isLoading, setIsLoading] = useState(false);
  const sseRef = useRef<EventSource | null>(null);

  // Load initial data
  const fetchAllData = async () => {
    try {
      const [tasksRes, wfRes, memRes, permRes] = await Promise.all([
        fetch('/api/tasks').then((r) => r.json()),
        fetch('/api/workflows').then((r) => r.json()),
        fetch('/api/memory').then((r) => r.json()),
        fetch('/api/permissions').then((r) => r.json()),
      ]);
      setTasksList(tasksRes.tasks || []);
      setWorkflowsList(wfRes.workflows || []);
      setMemory(memRes || {});
      setPermissions(permRes || {});
    } catch (e) {
      console.error('Failed to load initial data:', e);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Connect SSE for active task
  const connectSSE = (taskId: string) => {
    if (sseRef.current) {
      sseRef.current.close();
    }

    const sse = new EventSource(`/api/agent/stream/${taskId}`);
    sseRef.current = sse;

    sse.addEventListener('snapshot', (e: any) => {
      const task = JSON.parse(e.data);
      setActiveTask(task);
    });

    sse.addEventListener('status', (e: any) => {
      const { status, message } = JSON.parse(e.data);
      setActiveTask((prev) => (prev ? { ...prev, status } : null));
    });

    sse.addEventListener('interpreted', (e: any) => {
      const interpretation = JSON.parse(e.data);
      setActiveTask((prev) => (prev ? { ...prev, interpretation } : null));
    });

    sse.addEventListener('planGenerated', (e: any) => {
      const plan = JSON.parse(e.data);
      setActiveTask((prev) => (prev ? { ...prev, plan } : null));
    });

    sse.addEventListener('stepExecuted', (e: any) => {
      const step = JSON.parse(e.data);
      setActiveTask((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          steps: [...prev.steps, step],
        };
      });
    });

    sse.addEventListener('screenshotCaptured', (e: any) => {
      const screenshot = JSON.parse(e.data);
      setActiveTask((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          screenshots: [...prev.screenshots, screenshot],
        };
      });
    });

    sse.addEventListener('confirmationRequired', (e: any) => {
      const confirmation = JSON.parse(e.data);
      setActiveTask((prev) => (prev ? { ...prev, pendingConfirmation: confirmation, status: 'WAITING_CONFIRMATION' } : null));
    });

    sse.addEventListener('clarificationRequired', (e: any) => {
      const clarification = JSON.parse(e.data);
      setActiveTask((prev) => (prev ? { ...prev, pendingClarification: clarification, status: 'WAITING_CLARIFICATION' } : null));
    });

    sse.addEventListener('taskCompleted', (e: any) => {
      const task = JSON.parse(e.data);
      setActiveTask(task);
      setIsLoading(false);
      fetchAllData();
      sse.close();
    });

    sse.addEventListener('taskFailed', (e: any) => {
      setIsLoading(false);
      setActiveTask((prev) => (prev ? { ...prev, status: 'FAILED' } : null));
      fetchAllData();
      sse.close();
    });
  };

  // Run Task
  const handleRunTask = async (prompt: string, options: { headless: boolean }) => {
    setIsLoading(true);
    setActiveTab('new-task');

    try {
      const res = await fetch('/api/agent/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: prompt, headless: options.headless }),
      });
      const data = await res.json();
      if (data.success && data.taskId) {
        connectSSE(data.taskId);
      }
    } catch (error) {
      console.error('Failed to start task:', error);
      setIsLoading(false);
    }
  };

  // Task Controls
  const handlePause = async () => {
    if (!activeTask) return;
    await fetch('/api/agent/pause', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: activeTask.id }),
    });
  };

  const handleResume = async () => {
    if (!activeTask) return;
    await fetch('/api/agent/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: activeTask.id }),
    });
  };

  const handleTakeControl = async () => {
    if (!activeTask) return;
    await fetch('/api/agent/takeover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: activeTask.id }),
    });
  };

  const handleStop = async () => {
    if (!activeTask) return;
    await fetch('/api/agent/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: activeTask.id }),
    });
    setIsLoading(false);
  };

  const handleConfirm = async (approved: boolean) => {
    if (!activeTask) return;
    await fetch('/api/agent/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: activeTask.id, approved }),
    });
  };

  const handleClarifySubmit = async (answers: Record<string, string>) => {
    if (!activeTask) return;
    await fetch('/api/agent/clarify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: activeTask.id, answers }),
    });
  };

  const handleDeleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (activeTask?.id === id) setActiveTask(null);
    fetchAllData();
  };

  const handleSaveMemory = async (newMemory: MemorySettings) => {
    const res = await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMemory),
    });
    const updated = await res.json();
    setMemory(updated);
  };

  const handleSavePermissions = async (newPerms: PermissionSettings) => {
    const res = await fetch('/api/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPerms),
    });
    const updated = await res.json();
    setPermissions(updated);
  };

  const currentStatus: TaskStatus = activeTask?.status || (isLoading ? 'RUNNING' : 'IDLE');
  const isPaused = currentStatus === 'PAUSED' || currentStatus === 'HUMAN_TAKEOVER';

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      {/* Top Header */}
      <Header
        status={currentStatus}
        isPaused={isPaused}
        onPause={handlePause}
        onResume={handleResume}
        onTakeControl={handleTakeControl}
        onStop={handleStop}
        hasActiveTask={Boolean(activeTask && currentStatus !== 'COMPLETED' && currentStatus !== 'FAILED' && currentStatus !== 'STOPPED')}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          recentTasksCount={tasksList.length}
          workflowsCount={workflowsList.length}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto bg-slate-100/70 dark:bg-[#0A0E18]/80 p-6 transition-colors">
          {activeTab === 'new-task' && (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Human Takeover Banner */}
              <TakeoverBanner
                isActive={currentStatus === 'HUMAN_TAKEOVER'}
                onResume={handleResume}
              />

              {/* Natural Language Command Input */}
              <CommandBox onSubmit={handleRunTask} isLoading={isLoading} />

              {/* Active Task Workspace */}
              {activeTask && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Clarification Panel if awaiting clarification */}
                  {currentStatus === 'WAITING_CLARIFICATION' && activeTask.pendingClarification && (
                    <ClarificationPanel
                      clarification={activeTask.pendingClarification}
                      onSubmit={handleClarifySubmit}
                    />
                  )}

                  {/* Final Result View if Completed */}
                  {activeTask.finalResult && <FinalResultView task={activeTask} />}

                  {/* Plan Viewer */}
                  {activeTask.plan && activeTask.plan.length > 0 && (
                    <PlanViewer plan={activeTask.plan} currentStepIndex={activeTask.steps.length} />
                  )}

                  {/* Screenshots Gallery */}
                  {activeTask.screenshots && activeTask.screenshots.length > 0 && (
                    <ScreenshotGallery screenshots={activeTask.screenshots} />
                  )}

                  {/* Real-time Activity Timeline */}
                  <LiveActivityTimeline
                    timeline={activeTask.timeline}
                    steps={activeTask.steps}
                  />

                  {/* Sources Citation Panel */}
                  {activeTask.sources && activeTask.sources.length > 0 && (
                    <SourcePanel sources={activeTask.sources} />
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <TasksHistoryView
              tasks={tasksList}
              onSelectTask={(task) => {
                setActiveTask(task);
                setActiveTab('new-task');
              }}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'workflows' && (
            <WorkflowsView
              workflows={workflowsList}
              onRunWorkflow={(prompt) => handleRunTask(prompt, { headless: false })}
              onSaveWorkflow={async (wf) => {
                await fetch('/api/workflows', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(wf),
                });
                fetchAllData();
              }}
              onDeleteWorkflow={async (id) => {
                await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
                fetchAllData();
              }}
            />
          )}

          {activeTab === 'memory' && (
            <MemoryView memory={memory} onSaveMemory={handleSaveMemory} />
          )}

          {activeTab === 'permissions' && (
            <PermissionsView permissions={permissions} onSavePermissions={handleSavePermissions} />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        confirmation={activeTask?.pendingConfirmation || null}
        onApprove={() => handleConfirm(true)}
        onReject={() => handleConfirm(false)}
      />
    </div>
  );
};
