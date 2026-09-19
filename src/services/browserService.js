import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

/**
 * Launches a Playwright Chromium persistent browser context.
 * Stores cookies, localStorage, and session tokens across runs.
 *
 * @param {Object} [options]
 * @param {boolean} [options.headless=false] - Run in headless mode or visible window
 * @param {string} [options.profileDir] - Custom browser profile directory path
 * @returns {Promise<{ browser: import('playwright').BrowserContext, context: import('playwright').BrowserContext, page: import('playwright').Page, profileDir: string }>}
 */
export async function launchBrowser({ headless = false, profileDir } = {}) {
  const targetProfileDir = path.resolve(profileDir || config.browserProfileDir || 'browser-profile');

  // Ensure dedicated persistent profile directory exists
  if (!fs.existsSync(targetProfileDir)) {
    fs.mkdirSync(targetProfileDir, { recursive: true });
  }

  // Launch persistent context
  const context = await chromium.launchPersistentContext(targetProfileDir, {
    headless,
    viewport: { width: 1280, height: 720 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    locale: 'en-US',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--start-maximized',
    ],
  });

  // Get default page or create a new page if none open
  const pages = context.pages();
  const page = pages.length > 0 ? pages[0] : await context.newPage();

  return {
    browser: context, // Keeps backward compatibility for callers invoking browser.close()
    context,
    page,
    profileDir: targetProfileDir,
  };
}

/**
 * Navigates to a URL and waits for the page load.
 * @param {import('playwright').Page} page
 * @param {string} url
 * @param {Object} [options]
 * @returns {Promise<string>} Page title
 */
export async function navigateAndGetTitle(page, url, options = {}) {
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
    ...options,
  });
  return await page.title();
}

/**
 * Takes a screenshot of the current page and saves it to disk.
 * @param {import('playwright').Page} page
 * @param {string} relativeOrAbsolutePath
 * @returns {Promise<string>} Absolute path of saved screenshot
 */
export async function captureScreenshot(page, relativeOrAbsolutePath) {
  const absolutePath = path.resolve(relativeOrAbsolutePath);
  const dir = path.dirname(absolutePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await page.screenshot({ path: absolutePath, fullPage: false });
  return absolutePath;
}
