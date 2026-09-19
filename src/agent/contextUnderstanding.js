import { GeminiProvider } from '../llm/geminiProvider.js';

/**
 * @typedef {Object} ClarificationQuestion
 * @property {string} id
 * @property {string} question
 * @property {string} whyNeeded
 * @property {string[]} [suggestedOptions]
 */

/**
 * @typedef {Object} DynamicTaskSchema
 * @property {string} goal
 * @property {string} desiredOutcome
 * @property {Array<{ name: string, type: string, role: string }>} entities
 * @property {string[]} actions
 * @property {string[]} constraints
 * @property {string[]} preferences
 * @property {string[]} requiredContext
 * @property {string[]} providedContext
 * @property {Array<{ field: string, isEssential: boolean, canInfer: boolean, inferredValue?: string, rationale: string }>} missingContext
 * @property {Array<{ assumption: string, confidence: number, isSafe: boolean }>} assumptions
 * @property {string[]} uncertainties
 * @property {'LOW' | 'SENSITIVE' | 'HIGH'} riskLevel
 * @property {boolean} requiresClarification
 * @property {ClarificationQuestion[]} clarificationQuestions
 * @property {boolean} requiresConfirmation
 * @property {boolean} requiresHumanTakeover
 * @property {string} executionStrategy
 */

/**
 * Analyzes any open-world user request across 17 cognitive dimensions to determine task readiness,
 * essential vs optional context, safe inferences, and material ambiguity.
 *
 * @param {string} prompt - The raw user request
 * @param {Array<{ role: string, content: string, answers?: Record<string, string> }>} [history=[]] - Multi-turn conversation history
 * @param {Object} [userMemory={}] - Saved user preferences and rules
 * @returns {Promise<DynamicTaskSchema>}
 */
export async function analyzeTaskContext(prompt, history = [], userMemory = {}) {
  const provider = new GeminiProvider();

  const conversationContextStr = history.length > 0
    ? `\nPrior Conversation History & Provided Answers:\n${JSON.stringify(history, null, 2)}\n`
    : '';

  const memoryContextStr = userMemory && Object.keys(userMemory).length > 0
    ? `\nUser Preferences & Memory:\n${JSON.stringify(userMemory, null, 2)}\n`
    : '';

  const reasoningPrompt = `You are the Dynamic Context Understanding & Task Readiness Engine of an Open-World Browser Control Agent.
Treat every user request as an OPEN-WORLD problem. Do not rely on predefined lists, templates, or rigid categories.

User Request: "${prompt}"
${conversationContextStr}${memoryContextStr}

Perform a deep semantic evaluation across these 17 dimensions:
1. What is the user actually trying to accomplish? (Goal)
2. What is the desired final outcome?
3. What actions and browser capabilities may be required?
4. What information is required to accomplish those actions?
5. What information has the user already provided (including in prior turns)?
6. What information is missing?
7. Which missing information is ESSENTIAL vs OPTIONAL?
8. Which missing information can safely be inferred with reasonable defaults? (Record safe assumptions)
9. Which missing information must NEVER be guessed? (e.g. destinations, recipients, amounts, private credentials, legal/financial commitments)
10. What constraints, preferences, deadlines, locations, quantities, or accounts matter?
11. What risks are associated with the requested action?
12. Is the task ready for immediate execution?
13. Is CLARIFICATION required before execution?
    - Ask questions ONLY if missing information MATERIALLY prevents the agent from even starting the search or navigation (e.g. missing target subject, destination, or core query).
    - If enough parameters are present to search, browse, research, or retrieve options, mark "requiresClarification": false so execution can begin immediately.
    - Do NOT ask for payment or sensitive checkout info in clarification upfront; those are handled via the Policy Confirmation Gate during execution.
    - If clarification is needed, ask the MINIMUM useful questions (1 to 3 max). Explain briefly why each is needed and provide quick suggested options when helpful.
14. Is CONFIRMATION required before a sensitive or irreversible action? (Submissions, payments, emails, account changes)
15. Is HUMAN TAKEOVER likely required? (Logins, CAPTCHAs, 2FA)
16. Should the task be broken into multiple subtasks?
17. What is the recommended execution strategy?

Respond with ONLY a valid JSON object matching this schema:
{
  "goal": "Clear concise summary of primary objective",
  "desiredOutcome": "Specific description of the successful end state",
  "entities": [{"name": "...", "type": "...", "role": "..."}],
  "actions": ["search", "navigate", "extract", "compare", etc.],
  "constraints": ["constraint 1", "constraint 2"],
  "preferences": ["preference 1"],
  "requiredContext": ["context item 1", "context item 2"],
  "providedContext": ["provided item 1"],
  "missingContext": [
    {
      "field": "field name",
      "isEssential": true,
      "canInfer": false,
      "inferredValue": null,
      "rationale": "Why this is essential or why it can/cannot be inferred"
    }
  ],
  "assumptions": [
    {
      "assumption": "Assumed default parameter",
      "confidence": 0.85,
      "isSafe": true
    }
  ],
  "uncertainties": ["any minor uncertainty"],
  "riskLevel": "LOW or SENSITIVE or HIGH",
  "requiresClarification": true or false,
  "clarificationQuestions": [
    {
      "id": "q1",
      "question": "Concise, friendly question",
      "whyNeeded": "Brief explanation of why this materially matters",
      "suggestedOptions": ["Option A", "Option B", "Option C"]
    }
  ],
  "requiresConfirmation": true or false,
  "requiresHumanTakeover": false,
  "executionStrategy": "Brief summary of the planned approach"
}`;

  try {
    const raw = await provider.generateText(reasoningPrompt);
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Sanitize and validate fields
    return {
      goal: parsed.goal || prompt,
      desiredOutcome: parsed.desiredOutcome || 'Successful completion of the user request.',
      entities: Array.isArray(parsed.entities) ? parsed.entities : [],
      actions: Array.isArray(parsed.actions) ? parsed.actions : ['search', 'navigate', 'read_page'],
      constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
      preferences: Array.isArray(parsed.preferences) ? parsed.preferences : [],
      requiredContext: Array.isArray(parsed.requiredContext) ? parsed.requiredContext : [],
      providedContext: Array.isArray(parsed.providedContext) ? parsed.providedContext : [prompt],
      missingContext: Array.isArray(parsed.missingContext) ? parsed.missingContext : [],
      assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : [],
      uncertainties: Array.isArray(parsed.uncertainties) ? parsed.uncertainties : [],
      riskLevel: ['LOW', 'SENSITIVE', 'HIGH'].includes(parsed.riskLevel) ? parsed.riskLevel : 'LOW',
      requiresClarification: Boolean(parsed.requiresClarification && parsed.clarificationQuestions?.length > 0),
      clarificationQuestions: Array.isArray(parsed.clarificationQuestions) ? parsed.clarificationQuestions : [],
      requiresConfirmation: Boolean(parsed.requiresConfirmation),
      requiresHumanTakeover: Boolean(parsed.requiresHumanTakeover),
      executionStrategy: parsed.executionStrategy || 'Direct web search, navigation, extraction, and verification.',
    };
  } catch (error) {
    // Fallback safe interpretation if model call fails
    return {
      goal: prompt,
      desiredOutcome: 'Fulfill user request via browser automation.',
      entities: [],
      actions: ['open_url', 'read_page', 'extract_data'],
      constraints: [],
      preferences: [],
      requiredContext: [],
      providedContext: [prompt],
      missingContext: [],
      assumptions: [{ assumption: 'Standard search and navigation workflow', confidence: 0.9, isSafe: true }],
      uncertainties: [],
      riskLevel: 'LOW',
      requiresClarification: false,
      clarificationQuestions: [],
      requiresConfirmation: false,
      requiresHumanTakeover: false,
      executionStrategy: 'Navigate to relevant website and extract information.',
    };
  }
}

/**
 * Merges multi-turn user responses with existing conversation history.
 * @param {string} originalPrompt
 * @param {Array<any>} history
 * @param {Record<string, string>} newAnswers
 * @returns {Array<any>} updated conversation history
 */
export function mergeConversationContext(originalPrompt, history = [], newAnswers = {}) {
  const updatedHistory = [...history];

  if (updatedHistory.length === 0) {
    updatedHistory.push({
      role: 'user',
      content: originalPrompt,
    });
  }

  const answerSummaries = Object.entries(newAnswers)
    .filter(([_, val]) => Boolean(val && String(val).trim()))
    .map(([key, val]) => `${key}: ${val}`)
    .join(', ');

  if (answerSummaries) {
    updatedHistory.push({
      role: 'user_clarification',
      content: `User provided clarification details: ${answerSummaries}`,
      answers: newAnswers,
    });
  }

  return updatedHistory;
}
