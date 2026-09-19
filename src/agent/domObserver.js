/**
 * DOM Observer module that extracts a clean, token-efficient summary of visible interactive elements.
 */

/**
 * Extracts a concise summary of the current page DOM structure and interactive elements.
 * @param {import('playwright').Page} page
 * @returns {Promise<{ title: string, url: string, headings: string[], interactiveElements: Array<{ tag: string, type?: string, text?: string, name?: string, id?: string, placeholder?: string, selector: string }> }>}
 */
export async function getCompactDomSnapshot(page) {
  return await page.evaluate(() => {
    const title = document.title;
    const url = window.location.href;

    // 1. Extract main headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, [role="heading"]'))
      .map((el) => el.textContent?.trim())
      .filter(Boolean)
      .slice(0, 6);

    // 2. Extract visible interactive elements
    const elements = Array.from(
      document.querySelectorAll(
        'button, a[href], input:not([type="hidden"]), textarea, select, [role="button"], [role="link"], [role="searchbox"]'
      )
    );

    const interactiveElements = [];

    for (const el of elements) {
      if (interactiveElements.length >= 25) break;

      // Check visibility
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const isVisible =
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        style.opacity !== '0';

      if (!isVisible) continue;

      const tag = el.tagName.toLowerCase();
      const type = el.getAttribute('type') || undefined;
      const text = el.textContent?.trim().slice(0, 60) || undefined;
      const name = el.getAttribute('name') || undefined;
      const id = el.id || undefined;
      const placeholder = el.getAttribute('placeholder') || undefined;
      const ariaLabel = el.getAttribute('aria-label') || undefined;

      // Generate a precise CSS selector suggestion
      let selector = '';
      if (id) {
        selector = `#${id}`;
      } else if (name) {
        selector = `${tag}[name="${name}"]`;
      } else if (placeholder) {
        selector = `${tag}[placeholder="${placeholder}"]`;
      } else if (ariaLabel) {
        selector = `${tag}[aria-label="${ariaLabel}"]`;
      } else if (type && tag === 'input') {
        selector = `input[type="${type}"]`;
      } else {
        selector = tag;
      }

      interactiveElements.push({
        tag,
        type,
        text,
        name,
        placeholder,
        ariaLabel,
        selector,
      });
    }

    return {
      title,
      url,
      headings,
      interactiveElements,
    };
  });
}
