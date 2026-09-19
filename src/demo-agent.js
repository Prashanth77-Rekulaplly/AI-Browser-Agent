import { runAgentTask } from './agent/agentLoop.js';

async function main() {
  const task = 'Open Google and search for Python courses.';
  
  const result = await runAgentTask(task, {
    headless: false, // Opens a visible Chromium window
    maxIterations: 8,
  });

  if (result.success) {
    console.log('Demo completed successfully!');
    process.exitCode = 0;
  } else {
    console.error('Demo failed.');
    process.exitCode = 1;
  }
}

main();
