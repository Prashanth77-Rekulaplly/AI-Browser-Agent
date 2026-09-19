import fs from 'fs';
import path from 'path';
import { launchBrowser } from './services/browserService.js';
import { config } from './config.js';

async function runPersistentProfileTest() {
  console.log('====================================================');
  console.log('Testing Playwright Persistent Browser Authentication');
  console.log('====================================================\n');

  const testProfileDir = path.resolve('browser-profile');
  console.log(`[Test 1] Checking profile directory configuration: ${testProfileDir}`);

  // Test 1: Profile directory created
  const instance1 = await launchBrowser({ headless: true, profileDir: testProfileDir });
  console.log('  -> Launched browser session #1');
  console.log(`  -> Profile directory exists on disk: ${fs.existsSync(testProfileDir)}`);

  const { page: page1, context: context1 } = instance1;

  // Navigate to an example page to store test cookies and localStorage
  console.log('\n[Test 2] Storing session cookies & localStorage in session #1...');
  await page1.goto('https://example.com', { waitUntil: 'domcontentloaded' });
  
  // Set test cookie (persistent with expiration)
  await context1.addCookies([
    {
      name: 'agent_session_token',
      value: 'session_auth_token_xyz987',
      domain: 'example.com',
      path: '/',
      httpOnly: true,
      secure: true,
      expires: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    },
  ]);

  // Set test localStorage
  await page1.evaluate(() => {
    localStorage.setItem('agent_user_logged_in', 'true');
    localStorage.setItem('agent_user_email', 'user@example.com');
  });

  console.log('  -> Cookie set: agent_session_token');
  console.log('  -> localStorage set: agent_user_logged_in = true');

  // Close browser session #1
  console.log('\n[Test 3] Closing browser session #1...');
  await instance1.browser.close();
  console.log('  -> Browser session #1 closed cleanly');

  // Short pause to allow Windows file locks to release
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Launch browser session #2 using the SAME persistent profile
  console.log('\n[Test 4] Launching browser session #2 with the SAME persistent profile...');
  const instance2 = await launchBrowser({ headless: true, profileDir: testProfileDir });
  const { page: page2, context: context2 } = instance2;

  await page2.goto('https://example.com', { waitUntil: 'domcontentloaded' });

  // Verify cookies in session #2
  const cookies = await context2.cookies('https://example.com');
  const foundCookie = cookies.find((c) => c.name === 'agent_session_token');
  console.log(`  -> Recovered Cookie: ${foundCookie ? foundCookie.name : 'NONE'}`);

  // Verify localStorage in session #2
  const storedValue = await page2.evaluate(() => localStorage.getItem('agent_user_logged_in'));
  console.log(`  -> Recovered localStorage: agent_user_logged_in = ${storedValue}`);

  // Assertions
  const cookiePersisted = foundCookie && foundCookie.value === 'session_auth_token_xyz987';
  const localStoragePersisted = storedValue === 'true';

  await instance2.browser.close();
  console.log('  -> Browser session #2 closed cleanly');

  console.log('\n====================================================');
  if (cookiePersisted && localStoragePersisted) {
    console.log('[SUCCESS] Persistent Browser Profile Verified!');
    console.log('Session authentication state safely survives browser restarts.');
    console.log('====================================================');
    process.exitCode = 0;
  } else {
    console.error('[FAILED] Cookies or localStorage failed to persist.');
    console.log('====================================================');
    process.exitCode = 1;
  }
}

runPersistentProfileTest().catch((err) => {
  console.error('[Error]:', err.message || err);
  process.exitCode = 1;
});
