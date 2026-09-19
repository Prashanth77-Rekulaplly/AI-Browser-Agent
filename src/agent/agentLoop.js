import { getGeminiClient } from '../services/geminiService.js';
import { launchBrowser } from '../services/browserService.js';
import { config } from '../config.js';
import { browserToolDeclarations } from './tools.js';
import { executeBrowserTool } from './executor.js';
import { buildSystemPrompt } from './prompts.js';
import { detectActionLoop, sanitizeSafetyOutput } from './guardrails.js';

async function sendMessageWithRetry(chat, payload, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await chat.sendMessage(payload);
    } catch (error) {
      attempt++;
      const isTransient =
        error.message &&
        (error.message.includes('429') ||
          error.message.includes('RESOURCE_EXHAUSTED') ||
          error.message.includes('503') ||
          error.message.includes('UNAVAILABLE') ||
          error.message.includes('high demand'));

      if (isTransient && attempt < maxRetries) {
        console.log(`\n[API Cooldown] Transient issue detected. Waiting 10s before retry (Attempt ${attempt}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
      } else {
        throw error;
      }
    }
  }
}

/**
 * Runs the controlled Gemini-Playwright agent loop for a specific task.
 * @param {string} taskDescription
 * @param {Object} [options]
 * @param {boolean} [options.headless=false] - Run with visible browser window
 * @param {number} [options.maxIterations=8] - Max turns to prevent runaway loops
 * @param {Function} [options.onStep] - Optional callback for live step updates
 * @returns {Promise<{ success: boolean, summary: string, steps: Array<any>, finalScreenshot?: string }>}
 */
export async function runAgentTask(taskDescription, options = {}) {
  const { headless = false, maxIterations = 8, onStep } = options;
  const ai = getGeminiClient();

  console.log('====================================================');
  console.log(`[Agent Loop] Starting Task: "${taskDescription}"`);
  console.log('====================================================');

  let browser = null;
  let page = null;
  const steps = [];
  let taskSummary = '';
  let finalScreenshotPath = '';

  try {
    // 1. Launch visible browser instance
    console.log('\n[1/3] Launching Chromium browser (visible window)...');
    const browserInstance = await launchBrowser({ headless });
    browser = browserInstance.browser;
    page = browserInstance.page;

    // 2. Initialize Gemini Chat Session with Tools & General-Purpose System Prompt
    console.log('[2/3] Initializing Gemini Chat Session with Browser Tools...');
    const systemInstruction = buildSystemPrompt(options);
    const chat = ai.chats.create({
      model: config.geminiModel,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: browserToolDeclarations }],
      },
    });

    console.log('\n[3/3] Running agent decision & execution loop...\n');

    // Initial message to the model
    let response = await sendMessageWithRetry(chat, {
      message: `User Goal: ${taskDescription}\nFormulate a brief plan and execute the necessary browser actions.`,
    });

    let iteration = 0;
    let isTaskFinished = false;

    while (iteration < maxIterations && !isTaskFinished) {
      iteration++;
      console.log(`--- Iteration ${iteration}/${maxIterations} ---`);

      const functionCalls = response.functionCalls || [];

      if (functionCalls.length === 0) {
        console.log(`Model Response: ${response.text || '(No text)'}`);
        // If the model didn't call a tool, we encourage it to finish or check state
        taskSummary = response.text || 'Task finished without explicit finish_task tool call.';
        break;
      }

      // Process each function call from Gemini
      for (const call of functionCalls) {
        const { name, args, id } = call;
        console.log(`[Gemini Decision] -> Tool: ${name}`);
        console.log(`[Arguments]       -> ${JSON.stringify(args)}`);

        // Execute via Playwright
        let result = await executeBrowserTool(page, name, args);
        result = sanitizeSafetyOutput(result);
        console.log(`[Browser Result]  -> ${JSON.stringify(result)}\n`);

        const stepData = {
          iteration,
          tool: name,
          args,
          result,
        };

        steps.push(stepData);

        if (typeof onStep === 'function') {
          try {
            onStep(stepData);
          } catch (callbackErr) {
            console.error('[onStep Callback Error]:', callbackErr);
          }
        }

        if (name === 'screenshot' && result.savedPath) {
          finalScreenshotPath = result.savedPath;
        }

        if (name === 'finish_task') {
          isTaskFinished = true;
          taskSummary = args.summary || result.summary || 'Task completed successfully.';
          break;
        }

        // Loop detection check
        const loopCheck = detectActionLoop(steps);
        if (loopCheck.isLoop) {
          console.warn(`[Loop Detection Warning] ${loopCheck.warning}`);
          result.loopWarning = loopCheck.warning;
        }

        // Send tool output back to Gemini
        response = await sendMessageWithRetry(chat, {
          message: [
            {
              functionResponse: {
                name,
                response: result,
                id,
              },
            },
          ],
        });
      }
    }

    // Ensure final screenshot is captured if not already done
    if (!finalScreenshotPath) {
      const fallbackScreenshot = 'screenshots/search-results.png';
      const result = await executeBrowserTool(page, 'screenshot', { filename: fallbackScreenshot });
      finalScreenshotPath = result.savedPath;
    }

    console.log('====================================================');
    console.log('[SUCCESS] Agent Task Completed');
    console.log('====================================================');
    console.log(`Summary: ${taskSummary}`);
    console.log(`Final Screenshot: ${finalScreenshotPath}`);
    console.log(`Total Steps Executed: ${steps.length}`);
    console.log('====================================================\n');

    return {
      success: true,
      summary: taskSummary,
      steps,
      finalScreenshot: finalScreenshotPath,
    };
  } catch (error) {
    console.error('\n[Agent Loop Error]:', error.message || error);
    return {
      success: false,
      summary: `Failed to complete task: ${error.message || error}`,
      steps,
      error: error.message || error,
    };
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
      console.log('Browser closed cleanly.');
    }
  }
}
