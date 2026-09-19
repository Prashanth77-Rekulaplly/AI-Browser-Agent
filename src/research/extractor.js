/**
 * Semantic extraction for research articles, tables, specifications, and prices.
 */

/**
 * Extracts structured facts and specifications from the active webpage.
 * @param {import('playwright').Page} page
 * @returns {Promise<{ title: string, url: string, content: string, tables: Array<any>, meta: Record<string, string> }>}
 */
export async function extractPageData(page) {
  return await page.evaluate(() => {
    const title = document.title;
    const url = window.location.href;

    // 1. Meta tags
    const meta = {};
    const metaTags = document.querySelectorAll('meta[name], meta[property]');
    for (const m of metaTags) {
      const key = m.getAttribute('name') || m.getAttribute('property');
      const val = m.getAttribute('content');
      if (key && val) meta[key] = val;
    }

    // 2. Extract tables
    const tables = [];
    const tableElements = document.querySelectorAll('table');
    for (const table of tableElements) {
      if (tables.length >= 3) break;
      const rows = Array.from(table.querySelectorAll('tr')).map((r) =>
        Array.from(r.querySelectorAll('th, td')).map((c) => c.textContent?.trim())
      );
      if (rows.length > 0) tables.push(rows);
    }

    // 3. Extract main article text
    const article = document.querySelector('article, main, #content, .content, [role="main"]');
    const content = (article || document.body).innerText?.trim().slice(0, 3000) || '';

    return {
      title,
      url,
      content,
      tables,
      meta,
    };
  });
}
