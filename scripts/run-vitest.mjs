import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const vitestBin = resolve(__dirname, '../node_modules/vitest/vitest.mjs');

const args = process.argv.slice(2);
let runInBandRequested = false;
const forwardedArgs = [];

for (const arg of args) {
  if (arg === '--runInBand' || arg === '-i') {
    runInBandRequested = true;
    continue;
  }
  forwardedArgs.push(arg);
}

if (runInBandRequested) {
  forwardedArgs.push('--sequence.concurrent=false');
}

const hasModeArgument = forwardedArgs.some((arg) =>
  ['run', 'watch', 'dev', 'related', 'bench', 'open'].includes(arg)
);

if (!hasModeArgument) {
  forwardedArgs.unshift('run');
}

const child = spawn(process.execPath, [vitestBin, ...forwardedArgs], {
  stdio: 'inherit',
  env: process.env
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
