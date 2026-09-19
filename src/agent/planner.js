import { GeminiProvider } from '../llm/geminiProvider.js';

/**
 * @typedef {Object} PlanStep
 * @property {string} id
 * @property {string} description
 * @property {string} status - 'pending'|'running'|'completed'|'failed'|'skipped'|'waiting_for_user'
 * @property {string} [requiredTool]
 * @property {Array<string>} [dependencies]
 * @property {any} [result]
 * @property {string[]} [screenshots]
 */

/**
 * Generates an initial multi-step execution plan for the interpreted goal.
 * @param {string} prompt
 * @param {Object} interpretation
 * @returns {Promise<PlanStep[]>}
 */
export async function generateExecutionPlan(prompt, interpretation = {}) {
  const provider = new GeminiProvider();

  const planPrompt = `You are a Browser Automation Planner.
Create a step-by-step execution plan (3 to 6 steps) to accomplish this task:
Goal: "${interpretation.goal || prompt}"
Constraints: ${JSON.stringify(interpretation.constraints || [])}

Available Tools: open_url, read_page, type_text, click, scroll_page, extract_data, screenshot, finish_task.

Respond with ONLY a JSON array of steps (no markdown, no backticks, no extra text) matching this schema:
[
  {
    "id": "step-1",
    "description": "Navigate to Google or target website",
    "requiredTool": "open_url"
  },
  {
    "id": "step-2",
    "description": "Perform search query or locate content",
    "requiredTool": "type_text"
  },
  {
    "id": "step-3",
    "description": "Inspect and extract data from results",
    "requiredTool": "extract_data"
  },
  {
    "id": "step-4",
    "description": "Capture proof screenshot and verify completion",
    "requiredTool": "screenshot"
  }
]`;

  try {
    const raw = await provider.generateText(planPrompt);
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const steps = JSON.parse(cleaned);
    return steps.map((s, idx) => ({
      id: s.id || `step-${idx + 1}`,
      description: s.description || `Step ${idx + 1}`,
      requiredTool: s.requiredTool || 'read_page',
      status: 'pending',
      dependencies: idx > 0 ? [`step-${idx}`] : [],
      result: null,
      screenshots: [],
    }));
  } catch (error) {
    // Deterministic fallback plan
    return [
      {
        id: 'step-1',
        description: 'Navigate to target webpage or search engine',
        requiredTool: 'open_url',
        status: 'pending',
        dependencies: [],
        result: null,
        screenshots: [],
      },
      {
        id: 'step-2',
        description: 'Locate information and interact with elements',
        requiredTool: 'type_text',
        status: 'pending',
        dependencies: ['step-1'],
        result: null,
        screenshots: [],
      },
      {
        id: 'step-3',
        description: 'Extract relevant content and verify findings',
        requiredTool: 'extract_data',
        status: 'pending',
        dependencies: ['step-2'],
        result: null,
        screenshots: [],
      },
      {
        id: 'step-4',
        description: 'Capture screenshot and generate final summary',
        requiredTool: 'finish_task',
        status: 'pending',
        dependencies: ['step-3'],
        result: null,
        screenshots: [],
      },
    ];
  }
}
