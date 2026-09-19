/**
 * Policy Engine: Classifies actions into Low Risk vs Sensitive/Irreversible.
 */

export const ActionRisk = {
  LOW: 'LOW',
  SENSITIVE: 'SENSITIVE',
  DANGEROUS: 'DANGEROUS',
};

// Tool actions that are inherently low risk (read-only, navigation, observation)
const LOW_RISK_TOOLS = new Set([
  'open_url',
  'read_page',
  'scroll_page',
  'hover',
  'wait_for_selector',
  'extract_data',
  'screenshot',
  'finish_task',
]);

// Keywords in selectors, text, or URLs that indicate a sensitive or irreversible action
const SENSITIVE_KEYWORDS = [
  'submit',
  'buy',
  'pay',
  'purchase',
  'checkout',
  'order',
  'delete',
  'remove',
  'destroy',
  'publish',
  'send email',
  'send message',
  'transfer',
  'confirm payment',
  'place order',
];

/**
 * Evaluates whether an intended browser action requires human confirmation.
 * @param {string} toolName
 * @param {Record<string, any>} args
 * @param {string} currentUrl
 * @returns {{ riskLevel: string, requiresConfirmation: boolean, reason?: string, details?: any }}
 */
export function evaluateActionPolicy(toolName, args = {}, currentUrl = '') {
  // 1. If tool is purely read-only / navigational
  if (LOW_RISK_TOOLS.has(toolName) && toolName !== 'open_url') {
    return {
      riskLevel: ActionRisk.LOW,
      requiresConfirmation: false,
    };
  }

  // 2. Evaluate 'click' or 'type_text' actions for sensitive keywords
  if (toolName === 'click' || toolName === 'type_text') {
    const combinedTarget = `${args.selector || ''} ${args.text || ''}`.toLowerCase();

    for (const keyword of SENSITIVE_KEYWORDS) {
      if (combinedTarget.includes(keyword)) {
        return {
          riskLevel: ActionRisk.SENSITIVE,
          requiresConfirmation: true,
          reason: `Action contains sensitive keyword "${keyword}" (e.g. form submission, payment, or publishing).`,
          details: {
            action: toolName,
            target: args.selector,
            text: args.text,
            currentUrl,
            keyword,
          },
        };
      }
    }
  }

  // 3. Default to LOW risk for normal web interactions
  return {
    riskLevel: ActionRisk.LOW,
    requiresConfirmation: false,
  };
}
