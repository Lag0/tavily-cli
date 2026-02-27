#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

function fail(message) {
  console.error(`[smoke] ${message}`);
  process.exit(1);
}

function run(command, args, label) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    fail(`${label} failed with exit code ${result.status ?? 1}.`);
  }
}

function runDoctorSmoke(distEntryPath) {
  const result = spawnSync(
    process.execPath,
    [distEntryPath, 'doctor', '--json', '--fix-dry-run'],
    {
      encoding: 'utf-8',
      env: process.env,
    }
  );

  const status = result.status ?? 1;
  if (status !== 0 && status !== 1) {
    fail(`doctor smoke command exited unexpectedly with code ${status}.`);
  }

  const combinedOutput = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  if (
    !combinedOutput.includes('"schemaVersion":"1.0"') &&
    !combinedOutput.includes('"schemaVersion": "1.0"')
  ) {
    fail('doctor smoke output is missing schemaVersion contract.');
  }

  if (!combinedOutput.includes('"fixes"')) {
    fail('doctor smoke output is missing fix-report contract.');
  }
}

function runUnknownCommandSmoke(distEntryPath) {
  const result = spawnSync(process.execPath, [distEntryPath, 'unknown-command'], {
    encoding: 'utf-8',
    env: process.env,
  });

  const status = result.status ?? 1;
  if (status !== 1) {
    fail(`unknown command smoke should exit with 1, got ${status}.`);
  }

  const errorOutput = `${result.stderr ?? ''}${result.stdout ?? ''}`;
  if (!errorOutput.includes('Error [INVALID_INPUT]:')) {
    fail('unknown command smoke output is missing deterministic runtime error prefix.');
  }
}

const distEntryPath = path.join(process.cwd(), 'dist', 'index.js');
if (!existsSync(distEntryPath)) {
  fail('Missing dist/index.js. Run `pnpm run build` before smoke.');
}

run(
  'pnpm',
  [
    'vitest',
    'run',
    'src/__tests__/integration/cli.test.ts',
    'src/__tests__/integration/cli-routing-regression.test.ts',
  ],
  'integration routing smoke tests'
);
runDoctorSmoke(distEntryPath);
runUnknownCommandSmoke(distEntryPath);

console.log('[smoke] Release smoke checks passed.');
