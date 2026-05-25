#!/usr/bin/env node
/** After dist:dir — inject runtime lives in resources/daemon/ (extraResources). */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { PACKAGED_DAEMON_FILES } from './packaged-daemon-files.mjs';

const root = process.cwd();
const unpackedRoot = join(root, 'release', 'win-unpacked');
const daemonDir = join(unpackedRoot, 'resources', 'daemon');

const relayExe = join(unpackedRoot, 'Relay.exe');
if (!existsSync(relayExe)) {
  console.error('verify-packaged-daemon: missing release/win-unpacked/Relay.exe — run npm run dist:dir first');
  process.exit(1);
}

const legacyUnpacked = join(unpackedRoot, 'resources', 'app.asar.unpacked');
if (existsSync(legacyUnpacked)) {
  console.error(
    'verify-packaged-daemon: app.asar.unpacked should not exist — remove asarUnpack and rebuild',
  );
  process.exit(1);
}

if (!existsSync(daemonDir)) {
  console.error('verify-packaged-daemon: missing resources/daemon/');
  process.exit(1);
}

for (const file of PACKAGED_DAEMON_FILES) {
  const path = join(daemonDir, file);
  if (!existsSync(path)) {
    console.error(`verify-packaged-daemon: missing resources/daemon/${file}`);
    process.exit(1);
  }
  console.log(`verify-packaged-daemon: ok ${file}`);
}
