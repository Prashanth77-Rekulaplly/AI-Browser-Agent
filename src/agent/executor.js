import path from 'path';
import fs from 'fs';
import { validateToolArguments } from './tools.js';
import { getCompactDomSnapshot } from './domObserver.js';

/**
 * Executes a validated browser tool against the active Playwright page.
 * @param {import('playwright').Page} page
 * @param {string} toolName
 * @param {Record<string, any>} args
 * @returns {Promise<Record<string, any>>}
 */
export async function executeBrowserTool(page, toolName, args = {}) {
  // 1. Validate tool arguments strictly
  validateToolArguments(toolName, args);

  // 2. Execute the appropriate Playwright action with timeouts
  try {
    switch (toolName) {
      case 'open_url': {
        await page.goto(args.url, {
          waitUntil: 'domcontentloaded',
          timeout: 20000,
        });
        await page.waitForTimeout(1000);
        const title = await page.title();
        const currentUrl = page.url();
        return {
          status: 'success',
          currentUrl,
          pageTitle: title,
          message: `Navigated to ${currentUrl}`,
        };
      }

      case 'read_page': {
        const snapshot = await getCompactDomSnapshot(page);
        return {
          status: 'success',
          currentUrl: snapshot.url,
          pageTitle: snapshot.title,
          headings: snapshot.headings,
          interactiveElements: snapshot.interactiveElements,
        };
      }

      case 'type_text': {
        const selector = args.selector;
        const text = args.text;
        const pressEnter = args.press_enter !== false; // defaults to true

        await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
        await page.fill(selector, text);

        if (pressEnter) {
          await page.keyboard.press('Enter');
          await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
          await page.waitForTimeout(1500);
        }

        const title = await page.title();
        const currentUrl = page.url();

        return {
          status: 'success',
          typed: text,
          selector,
          pressedEnter: pressEnter,
          currentUrl,
          pageTitle: title,
        };
      }

      case 'click': {
        const selector = args.selector;
        await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
        await page.click(selector, { timeout: 10000 });
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(1000);

        return {
          status: 'success',
          clicked: selector,
          currentUrl: page.url(),
          pageTitle: await page.title(),
        };
      }

      case 'scroll_page': {
        const direction = (args.direction || 'down').toLowerCase();
        const amount = typeof args.amount === 'number' ? args.amount : 500;
        const deltaY = direction === 'up' ? -amount : amount;

        await page.evaluate((y) => window.scrollBy({ top: y, behavior: 'smooth' }), deltaY);
        await page.waitForTimeout(800);

        return {
          status: 'success',
          direction,
          amount,
          message: `Scrolled ${direction} by ${amount}px`,
        };
      }

      case 'press_key': {
        const key = args.key;
        await page.keyboard.press(key);
        await page.waitForTimeout(500);

        return {
          status: 'success',
          key,
          message: `Pressed key "${key}"`,
        };
      }

      case 'hover': {
        const selector = args.selector;
        await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
        await page.hover(selector, { timeout: 10000 });
        await page.waitForTimeout(500);

        return {
          status: 'success',
          hovered: selector,
        };
      }

      case 'select_option': {
        const selector = args.selector;
        const value = args.value;
        await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
        await page.selectOption(selector, value);
        await page.waitForTimeout(500);

        return {
          status: 'success',
          selector,
          selectedValue: value,
        };
      }

      case 'wait_for_selector': {
        const selector = args.selector;
        const timeout = typeof args.timeout_ms === 'number' ? args.timeout_ms : 5000;
        await page.waitForSelector(selector, { state: 'visible', timeout });

        return {
          status: 'success',
          selector,
          message: `Element "${selector}" is now visible`,
        };
      }

      case 'extract_data': {
        const extracted = await page.evaluate((customQuery) => {
          if (customQuery) {
            const el = document.querySelector(customQuery);
            if (el) return el.innerText?.trim().slice(0, 1500);
          }
          const article = document.querySelector('article, main, #content, .content, [role="main"]');
          if (article) return article.innerText?.trim().slice(0, 1500);
          return document.body.innerText?.trim().slice(0, 1500);
        }, args.query);

        return {
          status: 'success',
          content: extracted,
        };
      }

      case 'screenshot': {
        const filename = args.filename || 'screenshots/search-results.png';
        const absolutePath = path.resolve(filename);
        const dir = path.dirname(absolutePath);

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        await page.screenshot({ path: absolutePath, fullPage: false });

        return {
          status: 'success',
          savedPath: absolutePath,
          message: `Screenshot captured and saved to ${filename}`,
        };
      }

      case 'finish_task': {
        return {
          status: 'finished',
          summary: args.summary,
        };
      }

      default:
        throw new Error(`Execution for tool "${toolName}" is not implemented.`);
    }
  } catch (error) {
    return {
      status: 'error',
      tool: toolName,
      error: error.message || String(error),
    };
  }
}
