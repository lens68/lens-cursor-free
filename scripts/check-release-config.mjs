#!/usr/bin/env node
/** Prod release gate: no localhost Hub, enableOpsTools must be false. */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
let channel = 'prod';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--channel' && args[i + 1]) {
    channel = args[++i];
  }
}

if (channel === 'ops' || channel === 'local') {
  console.log(`check-release-config: skip (${channel} channel)`);
  process.exit(0);
}

const path = join(root, 'build-config.json');
if (!existsSync(path)) {
  console.error('check-release-config: missing build-config.json — run prepare-build-config.mjs prod');
  process.exit(1);
}

const cfg = JSON.parse(readFileSync(path, 'utf8'));
const hub = String(cfg.defaultHubUrl ?? '').toLowerCase();
const errors = [];

if (!hub || hub.includes('127.0.0.1') || hub.includes('localhost')) {
  errors.push(`defaultHubUrl must not be localhost (got ${cfg.defaultHubUrl})`);
}
if (cfg.enableOpsTools === true) {
  errors.push('enableOpsTools must be false for production builds');
}

const iconPath = join(root, 'resources', 'icon.ico');
if (!existsSync(iconPath)) {
  errors.push('resources/icon.ico missing — required for release builds');
}

if (errors.length) {
  for (const e of errors) console.error(`check-release-config: ${e}`);
  process.exit(1);
}

console.log(`check-release-config: ok (hub=${cfg.defaultHubUrl})`);
