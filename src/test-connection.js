import { testGeminiConnection } from './services/geminiService.js';

async function main() {
  console.log('--- Testing Gemini API Connection ---');
  console.log('Sending test prompt: "Respond with exactly: \\"Gemini connection successful.\\""');

  try {
    const result = await testGeminiConnection();
    console.log('\n[SUCCESS] Connected to Gemini API successfully!');
    console.log(`Model: ${result.model}`);
    console.log(`Gemini Response: "${result.response}"`);
    process.exitCode = 0;
  } catch (error) {
    console.error('\n[FAILED] Gemini API Connection failed:');
    console.error(error.message);
    process.exitCode = 1;
  }
}

main();
