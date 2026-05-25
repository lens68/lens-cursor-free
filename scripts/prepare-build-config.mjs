#!/usr/bin/env node
/** Copy channel example → build-config.json (prod | ops | local). */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const channel = process.argv[2];
const force = process.argv.includes('--force');

const sources = {
  prod: 'build-config.prod.example.json',
  ops: 'build-config.ops.example.json',
  local: 'build-config.local.example.json',
};

/** Values in *.example.json that mean “fill in locally”. */
const PLACEHOLDER_VALUES = new Set([
  '',
  'https://your-support-page.example.com',
  'https://shop.example.com/licenses',
  'https://your-shop.example.com/licenses',
  'http://127.0.0.1:8765',
  'https://hub.your-domain.com',
]);

function isPlaceholder(value) {
  if (value == null) return true;
  return PLACEHOLDER_VALUES.has(String(value).trim());
}

function mergePreservedFields(next, previous) {
  if (!previous || typeof previous !== 'object') return next;
  const out = { ...next };
  for (const key of Object.keys(out)) {
    if (isPlaceholder(out[key]) && !isPlaceholder(previous[key])) {
      out[key] = previous[key];
    }
  }
  return out;
}

if (!channel || !sources[channel]) {
  console.error('Usage: node scripts/prepare-build-config.mjs prod|ops|local [--force]');
  console.error('  --force  overwrite build-config.json without keeping local non-placeholder fields');
  process.exit(1);
}

const src = join(root, sources[channel]);
if (!existsSync(src)) {
  console.error(`missing ${sources[channel]}`);
  process.exit(1);
}

const dest = join(root, 'build-config.json');
let previous = null;
if (!force && existsSync(dest)) {
  try {
    previous = JSON.parse(readFileSync(dest, 'utf8'));
  } catch {
    previous = null;
  }
}

copyFileSync(src, dest);
let cfg = JSON.parse(readFileSync(dest, 'utf8'));
if (previous) {
  cfg = mergePreservedFields(cfg, previous);
  writeFileSync(dest, `${JSON.stringify(cfg, null, 2)}\n`, 'utf8');
}

const preserved = previous
  ? Object.keys(cfg).filter(
      (k) => previous[k] !== undefined && String(previous[k]) !== String(cfg[k]),
    )
  : [];
const preservedNote =
  preserved.length > 0
    ? ` preserved=${preserved.join(',')}`
    : force
      ? ' (forced overwrite)'
      : '';
console.log(
  `prepare-build-config: ${channel} → build-config.json (hub=${cfg.defaultHubUrl}, ops=${cfg.enableOpsTools})${preservedNote}`,
);
