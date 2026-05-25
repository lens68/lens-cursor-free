#!/usr/bin/env node
/** dist:win orchestration — clean output dir, build, package, report size. */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();

function run(cmd, args, env = process.env) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    env,
    encoding: 'utf8',
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

function readOutputDir() {
  const flag = join(root, '.dist-output-dir');
  if (existsSync(flag)) {
    const line = readFileSync(flag, 'utf8').trim();
    if (line) return line;
  }
  return 'release';
}

run('node', ['scripts/pre-dist-clean.mjs']);
const outputDir = readOutputDir();
run('node', ['scripts/check-release-config.mjs']);
run('node', ['scripts/require-local-core.mjs']);
run('npm', ['run', 'build:full']);
run(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['electron-builder', '--win', '--x64', `-c.directories.output=${outputDir}`],
  { ...process.env, CSC_IDENTITY_AUTO_DISCOVERY: 'false' },
);
run('node', ['scripts/report-installer-size.mjs', outputDir]);
