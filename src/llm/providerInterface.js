/**
 * Base interface for LLM Providers.
 */
export class BaseLLMProvider {
  /**
   * @param {Object} config
   */
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Creates a multi-turn chat session with tools.
   * @param {Object} params
   * @returns {any}
   */
  createChatSession(params) {
    throw new Error('createChatSession must be implemented by subclass');
  }

  /**
   * Generates structured text or JSON content from a prompt.
   * @param {string} prompt
   * @param {Object} [options]
   * @returns {Promise<string>}
   */
  async generateText(prompt, options = {}) {
    throw new Error('generateText must be implemented by subclass');
  }
}
