#!/usr/bin/env node
/** Print NSIS installer size after dist:win (for release checklist). */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const outputName = process.argv[2]?.trim() || 'release';
const releaseDir = join(process.cwd(), outputName);
let files = [];
try {
  files = readdirSync(releaseDir).filter((f) => f.endsWith('.exe') && f.includes('Setup'));
} catch {
  console.error(`report-installer-size: no ${outputName}/ folder — run npm run dist:win first`);
  process.exit(1);
}
if (!files.length) {
  console.error(`report-installer-size: no Relay-Setup-*.exe in ${outputName}/`);
  process.exit(1);
}
for (const f of files.sort()) {
  const bytes = statSync(join(releaseDir, f)).size;
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  console.log(`${f}: ${mb} MB (${bytes} bytes)`);
}
const unpacked = join(releaseDir, 'win-unpacked');
try {
  const walk = (dir) => {
    let total = 0;
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, ent.name);
      if (ent.isDirectory()) total += walk(p);
      else total += statSync(p).size;
    }
    return total;
  };
  const u = walk(unpacked);
  console.log(`win-unpacked/ (do NOT ship this folder): ${(u / (1024 * 1024)).toFixed(1)} MB`);
  console.log('Users should download the Setup .exe only.');
} catch {
  /* dist:win without --dir may omit win-unpacked */
}
