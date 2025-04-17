#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Run Vite dev server
const vite = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
  stdio: 'inherit',
  shell: true
});

console.log('Starting Vite development server on port 5000...');

// Handle process exit
process.on('SIGINT', () => {
  console.log('Shutting down development server...');
  vite.kill();
  process.exit(0);
});

vite.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
  process.exit(code);
});