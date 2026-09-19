import readline from 'readline';
import { launchBrowser, navigateAndGetTitle } from './services/browserService.js';
import { config } from './config.js';

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, () => {
      rl.close();
      resolve();
    });
  });
}

async function main() {
  const targetUrl = process.argv[2] || 'https://accounts.google.com';

  console.log('====================================================');
  console.log('       Persistent Browser Profile Login Helper      ');
  console.log('====================================================\n');
  console.log(`Browser Profile Directory: ${config.browserProfileDir}`);
  console.log(`Target Login URL:          ${targetUrl}\n`);
  console.log('Instructions:');
  console.log('1. The visible browser window is opening with your persistent profile.');
  console.log('2. Log into your account (Google, GitHub, etc.) manually.');
  console.log('3. Complete any 2FA or CAPTCHA verification in the browser.');
  console.log('4. NOTE: Passwords and tokens are NEVER captured, logged, or sent to AI models.');
  console.log('5. Once you are successfully logged in, return here and press [ENTER] to save & close.\n');

  let browserInstance = null;

  try {
    browserInstance = await launchBrowser({ headless: false });
    const { page } = browserInstance;

    console.log(`Navigating to ${targetUrl}...`);
    const title = await navigateAndGetTitle(page, targetUrl);
    console.log(`Current Page Title: "${title}"\n`);

    console.log('>>> Waiting for you to complete manual login in the browser window...');
    await promptUser('Press [ENTER] after you have completed login and reached your logged-in page: ');

    const finalTitle = await page.title();
    const finalUrl = page.url();
    console.log(`\nFinal Page: "${finalTitle}" (${finalUrl})`);
    console.log('Authentication session saved successfully to persistent profile!');
    console.log('Future agent executions will automatically reuse this session.');
    process.exitCode = 0;
  } catch (error) {
    console.error('Error during login helper session:', error.message || error);
    process.exitCode = 1;
  } finally {
    if (browserInstance?.browser) {
      console.log('Closing browser and saving profile state...');
      await browserInstance.browser.close();
      console.log('Browser closed cleanly. Profile persisted.');
    }
  }
}

main();
