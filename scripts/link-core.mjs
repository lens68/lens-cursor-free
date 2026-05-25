#!/usr/bin/env node
/** Link real @relay/core from sibling lens-cursor-free-core into node_modules. */
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const corePath = resolve(
  process.env.RELAY_CORE_PATH || join(root, '..', 'lens-cursor-free-core'),
);
const target = join(root, 'node_modules', '@relay', 'core');

if (!existsSync(join(corePath, 'package.json'))) {
  console.error(`link-core: missing ${corePath}`);
  process.exit(1);
}

const shellCfg = join(root, 'build-config.json');
const coreCfg = join(corePath, 'build-config.json');
if (existsSync(shellCfg)) {
  copyFileSync(shellCfg, coreCfg);
  console.log('link-core: synced build-config.json → core');
} else if (!existsSync(coreCfg)) {
  console.error(
    'link-core: missing build-config.json — create in shell repo or set BUILD_CONFIG_JSON in CI',
  );
  process.exit(1);
}

console.log(`link-core: building ${corePath}`);
const build = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
  cwd: corePath,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
if (build.status !== 0) process.exit(build.status ?? 1);

mkdirSync(join(root, 'node_modules', '@relay'), { recursive: true });
if (existsSync(target)) rmSync(target, { recursive: true, force: true });

const pkg = JSON.parse(readFileSync(join(corePath, 'package.json'), 'utf8'));
cpSync(corePath, target, {
  recursive: true,
  filter: (src) => {
    const rel = src.slice(corePath.length).replace(/\\/g, '/');
    if (rel.startsWith('/node_modules')) return false;
    if (rel.startsWith('/.git')) return false;
    return true;
  },
});

console.log('link-core: ok → node_modules/@relay/core');
