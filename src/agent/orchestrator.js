import EventEmitter from 'events';
import { getGeminiClient } from '../services/geminiService.js';
import { launchBrowser } from '../services/browserService.js';
import { config } from '../config.js';
import { browserToolDeclarations } from './tools.js';
import { executeBrowserTool } from './executor.js';
import { buildSystemPrompt } from './prompts.js';
import { detectActionLoop, sanitizeSafetyOutput } from './guardrails.js';
import { evaluateActionPolicy, ActionRisk } from '../security/policyEngine.js';
import { interpretTask } from './taskInterpreter.js';
import { mergeConversationContext } from './contextUnderstanding.js';
import { generateExecutionPlan } from './planner.js';
import { verifyTaskCompletion } from './validator.js';
import { createNewTask, saveTask, logTaskActivity, getTaskById } from '../storage/taskStore.js';
import { getMemory } from '../storage/memoryStore.js';

export class AgentOrchestrator extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
    this.taskId = null;
    this.status = 'IDLE';
    this.isPaused = false;
    this.isStopped = false;
    this.isTakeoverActive = false;
    this.pendingConfirmationResolver = null;
    this.pendingClarificationResolver = null;
    this.browserInstance = null;
    this.page = null;
    this.chat = null;
    this.taskRecord = null;
    this.conversationHistory = [];
  }

  /**
   * Updates state and emits changes.
   * @param {string} newStatus
   * @param {string} message
   * @param {Object} [metadata]
   */
  setStatus(newStatus, message, metadata = {}) {
    this.status = newStatus;
    if (this.taskRecord) {
      this.taskRecord.status = newStatus;
      saveTask(this.taskRecord);
      logTaskActivity(this.taskId, newStatus, message, metadata);
    }
    this.emit('status', { status: newStatus, message, metadata });
  }

  /**
   * Pauses the running agent.
   */
  pause() {
    this.isPaused = true;
    this.setStatus('PAUSED', 'Agent paused by user.');
  }

  /**
   * Resumes the paused agent.
   */
  resume() {
    this.isPaused = false;
    this.isTakeoverActive = false;
    this.setStatus('RUNNING', 'Agent resumed.');
    this.emit('resumed');
  }

  /**
   * Activates manual takeover (user drives browser).
   */
  takeControl() {
    this.isTakeoverActive = true;
    this.isPaused = true;
    this.setStatus('HUMAN_TAKEOVER', 'User took control of browser.');
  }

  /**
   * Stops the agent permanently.
   */
  stop() {
    this.isStopped = true;
    this.setStatus('STOPPED', 'Task stopped by user.');
    if (this.pendingConfirmationResolver) {
      this.pendingConfirmationResolver(false);
      this.pendingConfirmationResolver = null;
    }
    if (this.pendingClarificationResolver) {
      this.pendingClarificationResolver(null);
      this.pendingClarificationResolver = null;
    }
    this.cleanupBrowser();
  }

  /**
   * Resolves a pending confirmation with approve or reject.
   * @param {boolean} approved
   */
  resolveConfirmation(approved) {
    if (this.pendingConfirmationResolver) {
      this.pendingConfirmationResolver(approved);
      this.pendingConfirmationResolver = null;
      if (this.taskRecord) {
        this.taskRecord.pendingConfirmation = null;
        saveTask(this.taskRecord);
      }
      this.setStatus('RUNNING', approved ? 'Action confirmed by user.' : 'Action rejected by user.');
    }
  }

  /**
   * Resolves pending clarification questions with user answers.
   * @param {Record<string, string>} answers
   */
  resolveClarification(answers) {
    if (this.pendingClarificationResolver) {
      this.pendingClarificationResolver(answers);
      this.pendingClarificationResolver = null;
      if (this.taskRecord) {
        this.taskRecord.pendingClarification = null;
        saveTask(this.taskRecord);
      }
    }
  }

  /**
   * Waits if currently paused.
   */
  async waitIfPaused() {
    while (this.isPaused && !this.isStopped) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  /**
   * Executes a complete goal end-to-end with dynamic context understanding,
   * adaptive clarification, planning, and verification.
   *
   * @param {string} rawPrompt
   * @param {Object} [taskOptions]
   */
  async executeTask(rawPrompt, taskOptions = {}) {
    const { headless = false, maxIterations = 10 } = { ...this.options, ...taskOptions };
    this.isStopped = false;
    this.isPaused = false;
    this.conversationHistory = [{ role: 'user', content: rawPrompt }];

    // 1. Initialize Task Record
    this.taskRecord = createNewTask(rawPrompt);
    this.taskId = this.taskRecord.id;
    this.emit('taskCreated', this.taskRecord);

    try {
      const userMemory = getMemory();

      // 2. Stage: Analyzing & Open-World Context Understanding
      this.setStatus('ANALYZING', 'Analyzing request context and evaluating task readiness...');
      let interpretation = await interpretTask(rawPrompt, this.conversationHistory, userMemory);
      this.taskRecord.interpretation = interpretation;
      saveTask(this.taskRecord);
      this.emit('interpreted', interpretation);

      // 3. Stage: Adaptive Clarification Loop (if materially ambiguous)
      let clarificationTurns = 0;
      while (interpretation.requiresClarification && clarificationTurns < 3 && !this.isStopped) {
        clarificationTurns++;
        this.setStatus('WAITING_CLARIFICATION', 'Missing essential context. Awaiting clarification from user.', {
          questions: interpretation.clarificationQuestions,
        });

        this.taskRecord.pendingClarification = {
          questions: interpretation.clarificationQuestions,
          rationale: 'Essential information required to proceed accurately.',
        };
        saveTask(this.taskRecord);
        this.emit('clarificationRequired', this.taskRecord.pendingClarification);

        // Await user answers from UI or API
        const userAnswers = await new Promise((resolve) => {
          this.pendingClarificationResolver = resolve;
        });

        if (!userAnswers || this.isStopped) {
          break;
        }

        // Merge answers into conversation history
        this.conversationHistory = mergeConversationContext(rawPrompt, this.conversationHistory, userAnswers);

        // Re-analyze task readiness with the accumulated context
        this.setStatus('ANALYZING', 'Re-evaluating task readiness with updated clarification context...');
        interpretation = await interpretTask(rawPrompt, this.conversationHistory, userMemory);
        this.taskRecord.interpretation = interpretation;
        saveTask(this.taskRecord);
        this.emit('interpreted', interpretation);
      }

      if (this.isStopped) return this.taskRecord;

      // 4. Stage: Planning
      this.setStatus('PLANNING', 'Generating structured execution plan...');
      const plan = await generateExecutionPlan(interpretation.goal || rawPrompt, interpretation);
      this.taskRecord.plan = plan;
      saveTask(this.taskRecord);
      this.emit('planGenerated', plan);

      // 5. Stage: Launch Browser
      this.setStatus('RUNNING', 'Launching browser automation session...');
      this.browserInstance = await launchBrowser({ headless });
      this.page = this.browserInstance.page;

      // 6. Initialize Gemini Chat Session with System Prompt
      const ai = getGeminiClient();
      this.chat = ai.chats.create({
        model: config.geminiModel,
        config: {
          systemInstruction: buildSystemPrompt(),
          tools: [{ functionDeclarations: browserToolDeclarations }],
        },
      });

      // Build initial execution message incorporating goal, constraints, and assumptions
      const executionMessage = `User Goal: ${interpretation.goal || rawPrompt}
Desired Outcome: ${interpretation.desiredOutcome || 'Successful completion'}
Constraints: ${JSON.stringify(interpretation.constraints || [])}
Assumptions: ${JSON.stringify(interpretation.assumptions || [])}
Conversation History Context: ${JSON.stringify(this.conversationHistory.slice(1))}

Execute the goal step-by-step using available browser tools.`;

      let response = await this.chat.sendMessage({
        message: executionMessage,
      });

      let iteration = 0;
      let isTaskFinished = false;
      let finalSummary = '';

      while (iteration < maxIterations && !isTaskFinished && !this.isStopped) {
        await this.waitIfPaused();
        if (this.isStopped) break;

        iteration++;
        const functionCalls = response.functionCalls || [];

        if (functionCalls.length === 0) {
          finalSummary = response.text || 'Task finished without explicit finish_task.';
          break;
        }

        for (const call of functionCalls) {
          await this.waitIfPaused();
          if (this.isStopped) break;

          const { name, args, id } = call;
          const currentUrl = this.page.url();

          // A. Policy & Permission Check
          const policy = evaluateActionPolicy(name, args, currentUrl);
          if (policy.requiresConfirmation) {
            this.setStatus('WAITING_CONFIRMATION', policy.reason, policy.details);
            this.taskRecord.pendingConfirmation = {
              tool: name,
              args,
              reason: policy.reason,
              details: policy.details,
            };
            saveTask(this.taskRecord);
            this.emit('confirmationRequired', this.taskRecord.pendingConfirmation);

            // Wait for user approval
            const approved = await new Promise((resolve) => {
              this.pendingConfirmationResolver = resolve;
            });

            if (!approved) {
              const rejectedResult = { status: 'rejected', message: 'Action was rejected by user.' };
              response = await this.chat.sendMessage({
                message: [{ functionResponse: { name, response: rejectedResult, id } }],
              });
              continue;
            }
          }

          // B. Execute Tool Action
          let result = await executeBrowserTool(this.page, name, args);
          result = sanitizeSafetyOutput(result);

          // C. Detect Login / CAPTCHA
          if (result.pageTitle?.includes('sorry') || result.summaryContent?.includes('robot')) {
            this.setStatus('HUMAN_TAKEOVER', 'Bot detection or CAPTCHA detected. Please solve and click Resume.');
            this.emit('loginRequired', { url: currentUrl });
            this.isPaused = true;
            await this.waitIfPaused();
            // Re-read page after user resume
            result = await executeBrowserTool(this.page, 'read_page', {});
          }

          const stepData = {
            iteration,
            tool: name,
            args,
            result,
            time: new Date().toISOString(),
          };

          this.taskRecord.steps.push(stepData);

          // If screenshot captured, record it
          if (name === 'screenshot' && result.savedPath) {
            const screenshotMeta = {
              path: result.savedPath,
              filename: args.filename || 'screenshot.png',
              time: new Date().toISOString(),
              step: iteration,
              url: this.page.url(),
            };
            this.taskRecord.screenshots.push(screenshotMeta);
            this.emit('screenshotCaptured', screenshotMeta);
          }

          // If finished
          if (name === 'finish_task') {
            isTaskFinished = true;
            finalSummary = args.summary || result.summary || 'Task completed successfully.';
            break;
          }

          // Loop check
          const loopCheck = detectActionLoop(this.taskRecord.steps);
          if (loopCheck.isLoop) {
            result.loopWarning = loopCheck.warning;
          }

          // Update active plan step
          if (this.taskRecord.plan.length >= iteration) {
            this.taskRecord.plan[iteration - 1].status = 'completed';
            this.taskRecord.plan[iteration - 1].result = result;
          }

          saveTask(this.taskRecord);
          this.emit('stepExecuted', stepData);

          // Send feedback back to Gemini
          response = await this.chat.sendMessage({
            message: [{ functionResponse: { name, response: result, id } }],
          });
        }
      }

      // 7. Stage: Completion Verification
      this.setStatus('VERIFYING', 'Verifying task outcome against requested goal...');
      const verification = await verifyTaskCompletion(rawPrompt, this.taskRecord.steps, finalSummary);
      this.taskRecord.finalResult = {
        summary: finalSummary,
        verification,
        completedAt: new Date().toISOString(),
      };

      this.setStatus('COMPLETED', 'Task successfully completed and verified.');
      this.emit('taskCompleted', this.taskRecord);

      return this.taskRecord;
    } catch (error) {
      this.setStatus('FAILED', `Execution failed: ${error.message || error}`);
      if (this.taskRecord) {
        this.taskRecord.finalResult = { error: error.message || String(error) };
        saveTask(this.taskRecord);
      }
      this.emit('taskFailed', error);
      throw error;
    } finally {
      await this.cleanupBrowser();
    }
  }

  async cleanupBrowser() {
    if (this.browserInstance?.browser) {
      try {
        await this.browserInstance.browser.close();
      } catch {}
      this.browserInstance = null;
      this.page = null;
    }
  }
}
