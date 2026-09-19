import { config } from '../config.js';

/**
 * Security and safety guardrails for the AI Browser Agent.
 */

// Blocked internal or cloud metadata IP addresses
const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', '::1'];

/**
 * Validates that a target URL is secure and permissible to visit.
 * @param {string} urlString
 */
export function validateUrlSecurity(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    throw new Error('Invalid URL provided');
  }

  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error(`Malformed URL: "${urlString}"`);
  }

  // 1. Protocol allowlist
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(
      `Access to protocol "${parsed.protocol}" is blocked for security. Only "http:" and "https:" are permitted.`
    );
  }

  // 2. Block internal / localhost / cloud metadata navigation
  if (BLOCKED_HOSTS.includes(parsed.hostname.toLowerCase())) {
    throw new Error(
      `Access to internal/local address "${parsed.hostname}" is blocked for security.`
    );
  }

  return true;
}

/**
 * Detects if the agent is caught in an unproductive repetitive loop.
 * @param {Array<{ tool: string, args: any, result: any }>} steps
 * @returns {{ isLoop: boolean, warning?: string }}
 */
export function detectActionLoop(steps = []) {
  if (steps.length < 3) {
    return { isLoop: false };
  }

  const lastThree = steps.slice(-3);
  const isSameTool = lastThree.every((s) => s.tool === lastThree[0].tool);
  const isSameArgs = lastThree.every(
    (s) => JSON.stringify(s.args) === JSON.stringify(lastThree[0].args)
  );

  if (isSameTool && isSameArgs) {
    return {
      isLoop: true,
      warning: `Repeated action detected: The tool "${lastThree[0].tool}" was called with identical arguments 3 times consecutively. Try an alternative selector, navigate to another page, or use read_page.`,
    };
  }

  return { isLoop: false };
}

/**
 * Sanitizes any output to prevent API keys or secrets from being returned.
 * @param {any} content
 * @returns {any}
 */
export function sanitizeSafetyOutput(content) {
  if (!content) return content;
  let str = typeof content === 'string' ? content : JSON.stringify(content);

  if (config.geminiApiKey) {
    str = str.split(config.geminiApiKey).join('[REDACTED_API_KEY]');
  }

  return typeof content === 'string' ? str : JSON.parse(str);
}
