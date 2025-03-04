/**
 * Debug Test Script
 * 
 * A simple script to test file writing and logging.
 */

import * as fs from 'fs';
import { dirname } from 'path';

// Create the output directory if it doesn't exist
const logDir = './debug-logs';
try {
  if (!fs.existsSync(logDir)) {
    console.log(`Creating directory: ${logDir}`);
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (err) {
  console.error('Error creating directory:', err);
  // Try another location
  const altLogDir = '/tmp/debug-logs';
  try {
    if (!fs.existsSync(altLogDir)) {
      console.log(`Creating alternative directory: ${altLogDir}`);
      fs.mkdirSync(altLogDir, { recursive: true });
    }
  } catch (altErr) {
    console.error('Error creating alternative directory:', altErr);
  }
}

// Get current directory
const currentDir = process.cwd();
console.log(`Current working directory: ${currentDir}`);

// Try to write a test file
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const testLogFile = `${logDir}/test-${timestamp}.log`;

try {
  // Write to file
  fs.writeFileSync(testLogFile, `Test log created at ${new Date().toISOString()}\n`);
  console.log(`Successfully wrote to test log file: ${testLogFile}`);
  
  // Append to file
  fs.appendFileSync(testLogFile, `Appended at ${new Date().toISOString()}\n`);
  console.log(`Successfully appended to test log file: ${testLogFile}`);
  
  // Read file contents
  const contents = fs.readFileSync(testLogFile, 'utf8');
  console.log('File contents:', contents);
} catch (error) {
  console.error('Error working with log file:', error);
}

// Print environment
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Path:', process.env.PATH);

// Exit
console.log('Test completed.'); 