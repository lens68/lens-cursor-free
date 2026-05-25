import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const scriptsDir = join(fileURLToPath(import.meta.url), '..');

function runCheck(dir, extraArgs = []) {
  return spawnSync(
    process.execPath,
    [join(scriptsDir, 'check-release-config.mjs'), ...extraArgs],
    { cwd: dir, encoding: 'utf8' },
  );
}

test('check-release-config rejects placeholder hub', () => {
  const dir = mkdtempSync(join(tmpdir(), 'relay-chk-'));
  writeFileSync(
    join(dir, 'build-config.json'),
    JSON.stringify({
      defaultHubUrl: 'https://hub.your-domain.com',
      purchaseUrl: 'https://shop.example.com/licenses',
      enableOpsTools: false,
    }),
  );
  mkdirSync(join(dir, 'resources'), { recursive: true });
  writeFileSync(join(dir, 'resources', 'icon.ico'), Buffer.from([0]));
  const r = runCheck(dir);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr + r.stdout, /defaultHubUrl/i);
});

test('check-release-config rejects localhost hub', () => {
  const dir = mkdtempSync(join(tmpdir(), 'relay-chk-'));
  writeFileSync(
    join(dir, 'build-config.json'),
    JSON.stringify({
      defaultHubUrl: 'http://127.0.0.1:8765',
      purchaseUrl: 'https://pay.vendor.internal/shop',
      enableOpsTools: false,
    }),
  );
  mkdirSync(join(dir, 'resources'), { recursive: true });
  writeFileSync(join(dir, 'resources', 'icon.ico'), Buffer.from([0]));
  const r = runCheck(dir);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr + r.stdout, /127\.0\.0\.1|production URL/i);
});

test('check-release-config rejects enableOpsTools true', () => {
  const dir = mkdtempSync(join(tmpdir(), 'relay-chk-'));
  writeFileSync(
    join(dir, 'build-config.json'),
    JSON.stringify({
      defaultHubUrl: 'https://hub.vendor.example',
      purchaseUrl: 'https://pay.vendor.example/shop',
      enableOpsTools: true,
    }),
  );
  mkdirSync(join(dir, 'resources'), { recursive: true });
  writeFileSync(join(dir, 'resources', 'icon.ico'), Buffer.from([0]));
  const r = runCheck(dir);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr + r.stdout, /enableOpsTools/);
});

test('check-release-config accepts valid prod config', () => {
  const dir = mkdtempSync(join(tmpdir(), 'relay-chk-'));
  writeFileSync(
    join(dir, 'build-config.json'),
    JSON.stringify({
      defaultHubUrl: 'https://hub.vendor.example',
      purchaseUrl: 'https://pay.vendor.example/shop',
      enableOpsTools: false,
    }),
  );
  mkdirSync(join(dir, 'resources'), { recursive: true });
  writeFileSync(join(dir, 'resources', 'icon.ico'), Buffer.from([0]));
  const r = runCheck(dir);
  assert.equal(r.status, 0);
});

test('check-release-config ops channel skips', () => {
  const dir = mkdtempSync(join(tmpdir(), 'relay-chk-'));
  writeFileSync(
    join(dir, 'build-config.json'),
    JSON.stringify({
      defaultHubUrl: 'http://127.0.0.1:8765',
      enableOpsTools: true,
    }),
  );
  const r = runCheck(dir, ['--channel', 'ops']);
  assert.equal(r.status, 0);
});
