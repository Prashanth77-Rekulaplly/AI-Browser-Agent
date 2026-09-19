/**
 * Recovery strategies for browser action failures.
 */

/**
 * Attempts alternative locator strategies if a selector fails.
 * @param {import('playwright').Page} page
 * @param {string} originalSelector
 * @param {string} [actionType='click']
 * @returns {Promise<string | null>} working alternative selector if found
 */
export async function findAlternativeSelector(page, originalSelector, actionType = 'click') {
  // If original was a search input
  if (originalSelector.includes('q') || originalSelector.includes('search')) {
    const candidates = [
      'textarea[name="q"]',
      'input[name="q"]',
      'input[type="search"]',
      'input[type="text"]',
      '[role="searchbox"]',
      '#search',
      '#search-input',
    ];

    for (const candidate of candidates) {
      if (candidate === originalSelector) continue;
      try {
        const isVisible = await page.isVisible(candidate, { timeout: 1000 });
        if (isVisible) {
          return candidate;
        }
      } catch {}
    }
  }

  return null;
}
