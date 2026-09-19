import { chromium } from 'playwright';
import path from 'path';

async function runComprehensiveThemeTest() {
  console.log('====================================================');
  console.log('Comprehensive AI Browser Agent Theme & Input Verification');
  console.log('====================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // Clear localStorage to test default initial state
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded' });

    // 1. Verify Default Theme is Dark
    console.log('[Check 1] Default Theme when no localStorage exists:');
    const isDefaultDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    const bodyBgDark = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    console.log(`  -> Root contains .dark: ${isDefaultDark}`);
    console.log(`  -> Body background color: ${bodyBgDark}`);

    // 2. Test Input Typing in Dark Mode
    console.log('\n[Check 2] Command Input in Dark Mode:');
    const textarea = page.locator('textarea');
    await textarea.fill('Open Google and search for Python courses');

    const inputStylesDark = await page.evaluate(() => {
      const el = document.querySelector('textarea');
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
      };
    });
    console.log(`  -> Typed Text Color in Dark Mode: ${inputStylesDark.color} (Expected White: rgb(255, 255, 255))`);
    console.log(`  -> Input Background in Dark Mode: ${inputStylesDark.backgroundColor} (Expected Dark: rgb(13, 19, 31))`);

    await page.screenshot({ path: path.resolve('screenshots/test/dark-01-workspace.png') });

    // 3. Test Sidebar Navigation in Dark Mode
    console.log('\n[Check 3] Verifying all Sidebar Views in Dark Mode:');
    const tabs = ['Task History', 'Saved Workflows', 'Memory & Context', 'Policy & Security', 'Settings'];
    for (let i = 0; i < tabs.length; i++) {
      const tabName = tabs[i];
      await page.locator(`button:has-text("${tabName}")`).click();
      await page.waitForTimeout(200);
      const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      console.log(`  -> ${tabName} View in Dark Mode: ${isDark ? 'PASS' : 'FAIL'}`);
      await page.screenshot({ path: path.resolve(`screenshots/test/dark-0${i + 2}-${tabName.toLowerCase().replace(/[^a-z]/g, '')}.png`) });
    }

    // Switch back to Workspace
    await page.locator('button:has-text("Agent Workspace")').click();

    // 4. Click Theme Toggle -> Switch to Light Mode
    console.log('\n[Check 4] Clicking Theme Toggle (Switching to Light Mode)...');
    const toggleButton = page.locator('button[aria-label="Toggle Theme"]');
    await toggleButton.click();
    await page.waitForTimeout(300);

    const isLightNow = await page.evaluate(() => document.documentElement.classList.contains('light'));
    const storedThemeLight = await page.evaluate(() => localStorage.getItem('theme'));
    console.log(`  -> Root contains .light: ${isLightNow ? 'PASS' : 'FAIL'}`);
    console.log(`  -> localStorage theme: "${storedThemeLight}"`);

    // 5. Test Input Typing in Light Mode
    console.log('\n[Check 5] Command Input in Light Mode:');
    const inputStylesLight = await page.evaluate(() => {
      const el = document.querySelector('textarea');
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
      };
    });
    console.log(`  -> Typed Text Color in Light Mode: ${inputStylesLight.color} (Expected Dark: rgb(15, 23, 42))`);
    console.log(`  -> Input Background in Light Mode: ${inputStylesLight.backgroundColor} (Expected White: rgb(255, 255, 255))`);

    await page.screenshot({ path: path.resolve('screenshots/test/light-01-workspace.png') });

    // 6. Test Sidebar Navigation in Light Mode
    console.log('\n[Check 6] Verifying all Sidebar Views in Light Mode:');
    for (let i = 0; i < tabs.length; i++) {
      const tabName = tabs[i];
      await page.locator(`button:has-text("${tabName}")`).click();
      await page.waitForTimeout(200);
      const isLight = await page.evaluate(() => document.documentElement.classList.contains('light'));
      console.log(`  -> ${tabName} View in Light Mode: ${isLight ? 'PASS' : 'FAIL'}`);
      await page.screenshot({ path: path.resolve(`screenshots/test/light-0${i + 2}-${tabName.toLowerCase().replace(/[^a-z]/g, '')}.png`) });
    }

    // 7. Test Refresh Persistence in Light Mode
    console.log('\n[Check 7] Refreshing Page in Light Mode...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    const isLightAfterReload = await page.evaluate(() => document.documentElement.classList.contains('light'));
    console.log(`  -> Theme remains Light after reload: ${isLightAfterReload ? 'PASS' : 'FAIL'}`);

    // 8. Click Theme Toggle back -> Switch to Dark Mode
    console.log('\n[Check 8] Clicking Theme Toggle back (Switching to Dark Mode)...');
    await toggleButton.click();
    await page.waitForTimeout(300);

    const isDarkAgain = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    const storedThemeDark = await page.evaluate(() => localStorage.getItem('theme'));
    console.log(`  -> Root contains .dark: ${isDarkAgain ? 'PASS' : 'FAIL'}`);
    console.log(`  -> localStorage theme: "${storedThemeDark}"`);

    // 9. Test Refresh Persistence in Dark Mode
    console.log('\n[Check 9] Refreshing Page in Dark Mode...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    const isDarkAfterReload = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log(`  -> Theme remains Dark after reload: ${isDarkAfterReload ? 'PASS' : 'FAIL'}`);

    // Assertions
    const allPassed =
      isDefaultDark &&
      inputStylesDark.color === 'rgb(255, 255, 255)' &&
      inputStylesDark.backgroundColor === 'rgb(13, 19, 31)' &&
      isLightNow &&
      inputStylesLight.color === 'rgb(15, 23, 42)' &&
      inputStylesLight.backgroundColor === 'rgb(255, 255, 255)' &&
      isLightAfterReload &&
      isDarkAgain &&
      isDarkAfterReload;

    console.log('\n====================================================');
    if (allPassed) {
      console.log('[SUCCESS] All Theme & Input Verification Checks Passed!');
      console.log('Dark mode strictly matches reference; Light mode is fully responsive.');
      console.log('====================================================');
      process.exitCode = 0;
    } else {
      console.error('[FAILED] One or more theme verification checks failed.');
      console.log('====================================================');
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Error during test:', error.message || error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runComprehensiveThemeTest();
