import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
  browserProfileDir: process.env.BROWSER_PROFILE_DIR
    ? path.resolve(process.env.BROWSER_PROFILE_DIR)
    : path.resolve('browser-profile'),
};

/**
 * Validates that all required configuration settings are present.
 * Throws a sanitized error without exposing any secret values.
 */
export function validateConfig() {
  if (!config.geminiApiKey || config.geminiApiKey.trim() === '') {
    throw new Error(
      'Missing GEMINI_API_KEY: Please set the GEMINI_API_KEY environment variable in your .env file.'
    );
  }
}
