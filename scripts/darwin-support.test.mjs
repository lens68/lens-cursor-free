/**
 * Static macOS support checks (runs on any CI OS — no Mac required).
 * Guards against regressions in paths / packaging layout.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const coreCursorPaths = join(root, '..', 'lens-cursor-free-core', 'daemon', 'cursor-paths.ts');
const mainTs = readFileSync(join(root, 'electron', 'main.ts'), 'utf8');
const verifyDaemon = readFileSync(join(root, 'scripts', 'verify-packaged-daemon.mjs'), 'utf8');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

test('main.ts handles macOS Dock activate', () => {
  assert.match(mainTs, /app\.on\(['"]activate['"]/);
  assert.match(mainTs, /process\.platform !== ['"]darwin['"]/);
});

test('cursor-paths defines darwin Cursor.app and Library paths', { skip: !existsSync(coreCursorPaths) }, () => {
  const cursorPathsTs = readFileSync(coreCursorPaths, 'utf8');
  assert.match(cursorPathsTs, /platform\(\) === ['"]darwin['"]/);
  assert.match(cursorPathsTs, /Application Support['"],\s*['"]Cursor/);
  assert.match(cursorPathsTs, /\/Applications\/Cursor\.app\/Contents\/MacOS\/Cursor/);
  assert.match(cursorPathsTs, /opt\/homebrew\/bin\/node/);
});

test('verify-packaged-daemon checks Relay.app Contents/Resources/daemon', () => {
  assert.match(verifyDaemon, /Contents', 'Resources', 'daemon/);
});

test('electron-builder mac target and icon.png extraResource', () => {
  assert.ok(pkg.build?.mac?.icon?.includes('icon.png'));
  const extra = pkg.build?.extraResources ?? [];
  assert.ok(extra.some((e) => e.to && e.to === 'icon.png'));
  assert.ok(extra.some((e) => e.to === 'daemon'));
});
