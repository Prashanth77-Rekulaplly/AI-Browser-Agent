import { BaseLLMProvider } from './providerInterface.js';
import { getGeminiClient } from '../services/geminiService.js';
import { config } from '../config.js';

export class GeminiProvider extends BaseLLMProvider {
  constructor(options = {}) {
    super(options);
    this.model = options.model || config.geminiModel;
  }

  /**
   * Creates a Gemini chat session with tools and system prompt.
   * @param {Object} params
   * @param {string} params.systemInstruction
   * @param {Array} params.tools
   * @returns {any}
   */
  createChatSession({ systemInstruction, tools = [] }) {
    const ai = getGeminiClient();
    return ai.chats.create({
      model: this.model,
      config: {
        systemInstruction,
        tools: tools.length > 0 ? [{ functionDeclarations: tools }] : undefined,
      },
    });
  }

  /**
   * Generates text content directly.
   * @param {string} prompt
   * @param {Object} [options]
   * @returns {Promise<string>}
   */
  async generateText(prompt, options = {}) {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: options.config,
    });
    return response.text ? response.text.trim() : '';
  }
}
