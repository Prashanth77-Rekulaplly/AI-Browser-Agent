import path from 'path';
import { launchBrowser, navigateAndGetTitle, captureScreenshot } from './services/browserService.js';

async function runBrowserTest() {
  console.log('========================================');
  console.log('Starting Playwright Chromium Browser Test');
  console.log('========================================');

  let browser = null;
  const targetUrl = 'https://www.google.com';
  const screenshotRelativePath = 'screenshots/test/google-home.png';

  try {
    console.log('\n1. Launching Chromium (visible window)...');
    const instance = await launchBrowser({ headless: false });
    browser = instance.browser;
    const { page } = instance;

    console.log(`2. Navigating to: ${targetUrl}...`);
    const title = await navigateAndGetTitle(page, targetUrl);
    console.log(`\n>>> Page Title: "${title}"`);

    console.log(`\n3. Capturing screenshot...`);
    const screenshotPath = await captureScreenshot(page, screenshotRelativePath);
    console.log(`>>> Screenshot saved at: ${screenshotPath}`);

    console.log('\n========================================');
    console.log('[SUCCESS] Browser test completed successfully!');
    console.log('========================================');
    process.exitCode = 0;
  } catch (error) {
    console.error('\n========================================');
    console.error('[FAILED] Error during browser test execution:');
    console.error(error.message || error);
    console.error('========================================');
    process.exitCode = 1;
  } finally {
    if (browser) {
      console.log('\n4. Closing browser...');
      await browser.close();
      console.log('Browser closed cleanly.');
    }
  }
}

runBrowserTest();
