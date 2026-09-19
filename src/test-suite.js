import http from 'http';
import app from './server.js';
import { testGeminiConnection } from './services/geminiService.js';
import { config, validateConfig } from './config.js';
import { GoogleGenAI } from '@google/genai';

async function runTests() {
  console.log('========================================');
  console.log('Running Gemini Backend Verification Tests');
  console.log('========================================\n');

  let passed = 0;
  let total = 0;

  // Test 1: Direct Gemini API connection
  total++;
  try {
    console.log('[Test 1] Testing direct Gemini API connection...');
    const result = await testGeminiConnection();
    if (result.success && result.response.includes('Gemini connection successful.')) {
      console.log('  -> PASS: Gemini responded: "' + result.response + '"\n');
      passed++;
    } else {
      console.error('  -> FAIL: Unexpected response: ' + JSON.stringify(result) + '\n');
    }
  } catch (err) {
    console.error('  -> FAIL: Error connecting to Gemini: ' + err.message + '\n');
  }

  // Test 2: Missing API key error handling
  total++;
  try {
    console.log('[Test 2] Testing missing API key validation...');
    const originalKey = config.geminiApiKey;
    config.geminiApiKey = '';
    let threw = false;
    try {
      validateConfig();
    } catch (err) {
      threw = true;
      if (err.message.includes('Missing GEMINI_API_KEY')) {
        console.log('  -> PASS: Correctly caught missing API key with message: ' + err.message + '\n');
        passed++;
      } else {
        console.error('  -> FAIL: Unexpected error message: ' + err.message + '\n');
      }
    } finally {
      config.geminiApiKey = originalKey;
    }
    if (!threw) {
      console.error('  -> FAIL: validateConfig did not throw for empty key\n');
    }
  } catch (err) {
    console.error('  -> FAIL: ' + err.message + '\n');
  }

  // Test 3: Invalid API key handling
  total++;
  try {
    console.log('[Test 3] Testing invalid API key error handling...');
    const invalidAi = new GoogleGenAI({ apiKey: 'AIzaSyFakeKeyInvalid_123456789' });
    let threw = false;
    try {
      await invalidAi.models.generateContent({
        model: config.geminiModel,
        contents: 'test',
      });
    } catch (err) {
      threw = true;
      console.log('  -> PASS: Safely caught invalid API key error without crashing\n');
      passed++;
    }
    if (!threw) {
      console.error('  -> FAIL: Expected invalid key to throw\n');
    }
  } catch (err) {
    console.error('  -> FAIL: ' + err.message + '\n');
  }

  // Test 4: Express HTTP Server & Endpoints
  total++;
  try {
    console.log('[Test 4] Testing Express server endpoint GET /api/test-gemini...');
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;

    const res = await fetch(`http://localhost:${port}/api/test-gemini`);
    const data = await res.json();

    if (res.status === 200 && data.success && data.response.includes('Gemini connection successful.')) {
      console.log('  -> PASS: Express endpoint returned status 200 and valid payload:');
      console.log('     ' + JSON.stringify(data) + '\n');
      passed++;
    } else {
      console.error('  -> FAIL: Express endpoint returned: ' + JSON.stringify(data) + '\n');
    }

    server.close();
  } catch (err) {
    console.error('  -> FAIL: Express server test failed: ' + err.message + '\n');
  }

  console.log('========================================');
  console.log(`Test Results: ${passed}/${total} tests passed.`);
  console.log('========================================');

  if (passed === total) {
    process.exitCode = 0;
  } else {
    process.exitCode = 1;
  }
}

runTests();
