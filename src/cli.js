import readline from 'readline';
import { runAgentTask } from './agent/agentLoop.js';

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const isHeadless = args.includes('--headless');
  const taskArgs = args.filter((a) => a !== '--headless');

  let task = taskArgs.join(' ').trim();

  console.log('====================================================');
  console.log('       AI Browser Agent - Interactive CLI           ');
  console.log('====================================================\n');

  if (!task) {
    task = await promptUser('Enter task for the AI Browser Agent:\n> ');
  }

  if (!task) {
    console.error('No task provided. Exiting.');
    process.exitCode = 1;
    return;
  }

  console.log(`\nExecuting Goal: "${task}"`);
  console.log(`Browser Mode: ${isHeadless ? 'Headless (hidden)' : 'Visible window'}`);
  console.log(`Browser Profile: Persistent (./browser-profile)`);
  console.log(`Notice: Login once manually; future sessions reuse the saved browser profile.\n`);

  const result = await runAgentTask(task, {
    headless: isHeadless,
    maxIterations: 10,
    onStep: (step) => {
      console.log(`[Step ${step.iteration}] Executed ${step.tool}`);
    },
  });

  if (result.success) {
    console.log('\n====================================================');
    console.log('Task Completed Successfully!');
    console.log(`Summary: ${result.summary}`);
    if (result.finalScreenshot) {
      console.log(`Screenshot: ${result.finalScreenshot}`);
    }
    console.log('====================================================');
    process.exitCode = 0;
  } else {
    console.error('\n====================================================');
    console.error(`Task Failed: ${result.summary || result.error}`);
    console.error('====================================================');
    process.exitCode = 1;
  }
}

main();
