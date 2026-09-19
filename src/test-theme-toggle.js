import { chromium } from 'playwright';
import path from 'path';

async function testThemeToggle() {
  console.log('====================================================');
  console.log('Testing AI Browser Agent UI Theme Toggle');
  console.log('====================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    console.log('[Step 1] Navigating to Web UI (http://localhost:3000)...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Step 2: Check default theme (dark)
    const isInitialDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log(`[Step 2] Default Theme is Dark: ${isInitialDark ? 'PASS' : 'FAIL'}`);

    await page.screenshot({ path: path.resolve('screenshots/test/theme-dark.png') });
    console.log('  -> Captured Dark Mode screenshot: screenshots/test/theme-dark.png');

    // Step 3: Click Theme Toggle (Dark -> Light)
    console.log('\n[Step 3] Clicking Theme Toggle (Switching to Light Mode)...');
    const toggleButton = page.locator('button[aria-label="Toggle Theme"]');
    await toggleButton.click();

    await page.waitForTimeout(300); // Allow animation to settle

    const isLightAfterToggle = await page.evaluate(() => document.documentElement.classList.contains('light'));
    const storedTheme1 = await page.evaluate(() => localStorage.getItem('theme'));
    console.log(`  -> Theme is Light: ${isLightAfterToggle ? 'PASS' : 'FAIL'}`);
    console.log(`  -> localStorage theme value: "${storedTheme1}"`);

    await page.screenshot({ path: path.resolve('screenshots/test/theme-light.png') });
    console.log('  -> Captured Light Mode screenshot: screenshots/test/theme-light.png');

    // Step 4: Refresh page and test persistence
    console.log('\n[Step 4] Reloading page to verify persistence across refreshes...');
    await page.reload({ waitUntil: 'domcontentloaded' });

    const isLightAfterReload = await page.evaluate(() => document.documentElement.classList.contains('light'));
    console.log(`  -> Theme remains Light after reload: ${isLightAfterReload ? 'PASS' : 'FAIL'}`);

    // Step 5: Click Theme Toggle back (Light -> Dark)
    console.log('\n[Step 5] Clicking Theme Toggle back (Switching to Dark Mode)...');
    await toggleButton.click();
    await page.waitForTimeout(300);

    const isDarkAgain = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    const storedTheme2 = await page.evaluate(() => localStorage.getItem('theme'));
    console.log(`  -> Theme is Dark again: ${isDarkAgain ? 'PASS' : 'FAIL'}`);
    console.log(`  -> localStorage theme value: "${storedTheme2}"`);

    // Step 6: Reload page and test persistence
    console.log('\n[Step 6] Reloading page to verify Dark theme persistence...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    const isDarkAfterReload = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log(`  -> Theme remains Dark after reload: ${isDarkAfterReload ? 'PASS' : 'FAIL'}`);

    console.log('\n====================================================');
    if (isInitialDark && isLightAfterToggle && isLightAfterReload && isDarkAgain && isDarkAfterReload) {
      console.log('[SUCCESS] All Theme Toggle & Persistence Tests Passed!');
      console.log('====================================================');
      process.exitCode = 0;
    } else {
      console.error('[FAILED] One or more theme tests failed.');
      console.log('====================================================');
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Error during theme test:', error.message || error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

testThemeToggle();
