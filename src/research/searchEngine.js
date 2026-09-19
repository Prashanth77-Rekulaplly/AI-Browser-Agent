/**
 * Search Engine coordinator for multi-engine queries (Google, Bing, DuckDuckGo, Wikipedia).
 */

export const SearchEngines = {
  GOOGLE: 'https://www.google.com/search?q=',
  BING: 'https://www.bing.com/search?q=',
  DUCKDUCKGO: 'https://duckduckgo.com/?q=',
  WIKIPEDIA: 'https://en.wikipedia.org/wiki/Special:Search?search=',
};

/**
 * Builds a search URL for a given engine and query.
 * @param {string} query
 * @param {keyof typeof SearchEngines} [engine='GOOGLE']
 * @returns {string}
 */
export function buildSearchUrl(query, engine = 'GOOGLE') {
  const base = SearchEngines[engine] || SearchEngines.GOOGLE;
  return `${base}${encodeURIComponent(query)}`;
}

/**
 * Extracts links and snippets from search engine results pages.
 * @param {import('playwright').Page} page
 * @returns {Promise<Array<{ title: string, url: string, snippet: string }>>}
 */
export async function parseSearchResults(page) {
  return await page.evaluate(() => {
    const results = [];
    const elements = document.querySelectorAll('a:has(h3), div.g a, li.b_algo h2 a, .result__title a');

    for (const el of elements) {
      if (results.length >= 8) break;
      const href = el.getAttribute('href');
      const title = el.textContent?.trim();

      if (href && title && (href.startsWith('http://') || href.startsWith('https://')) && !href.includes('google.com/search')) {
        results.push({
          title,
          url: href,
          snippet: el.closest('div, li')?.textContent?.trim().slice(0, 200) || '',
        });
      }
    }

    return results;
  });
}
