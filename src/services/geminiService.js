import { GoogleGenAI } from '@google/genai';
import { config, validateConfig } from '../config.js';

let aiClient = null;

/**
 * Returns a singleton instance of the GoogleGenAI client.
 * Throws an error if GEMINI_API_KEY is not configured.
 */
export function getGeminiClient() {
  validateConfig();
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return aiClient;
}

/**
 * Sends a test message to Gemini asking it to respond: "Gemini connection successful."
 * @returns {Promise<{ success: boolean, model: string, response: string }>}
 */
export async function testGeminiConnection(maxRetries = 2) {
  validateConfig();

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: config.geminiModel,
        contents: 'Respond with exactly: "Gemini connection successful."',
      });

      const text = response.text ? response.text.trim() : '';

      return {
        success: true,
        model: config.geminiModel,
        response: text,
      };
    } catch (error) {
      attempt++;
      const isTransient =
        error.message &&
        (error.message.includes('429') ||
          error.message.includes('RESOURCE_EXHAUSTED') ||
          error.message.includes('503') ||
          error.message.includes('UNAVAILABLE'));

      if (isTransient && attempt <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 8000));
        continue;
      }

      // Sanitize any potential leak of secrets in error objects
      const safeErrorMessage = sanitizeErrorMessage(error);
      const err = new Error(safeErrorMessage);
      err.originalStatus = error?.status || error?.statusCode || 500;
      throw err;
    }
  }
}

/**
 * Strips any occurrence of the API key from error messages
 * @param {Error|any} error 
 * @returns {string}
 */
function sanitizeErrorMessage(error) {
  if (!error) return 'Unknown error occurred while contacting Gemini API.';
  let message = error.message || String(error);

  if (config.geminiApiKey) {
    message = message.split(config.geminiApiKey).join('[REDACTED]');
  }
  return message;
}
