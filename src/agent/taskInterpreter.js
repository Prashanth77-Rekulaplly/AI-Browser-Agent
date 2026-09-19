import { analyzeTaskContext } from './contextUnderstanding.js';

/**
 * Interprets a raw user command into a structured task specification
 * using open-world dynamic semantic reasoning.
 *
 * @param {string} prompt
 * @param {Array<any>} [history=[]]
 * @param {Object} [userMemory={}]
 * @returns {Promise<import('./contextUnderstanding.js').DynamicTaskSchema>}
 */
export async function interpretTask(prompt, history = [], userMemory = {}) {
  return await analyzeTaskContext(prompt, history, userMemory);
}
