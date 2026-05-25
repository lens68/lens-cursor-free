#!/usr/bin/env node
/**
 * Generate resources/icon.ico from resources/icon-source.svg (Relay brand).
 * Requires: sharp, to-ico, pngjs (devDependencies).
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import toIco from 'to-ico';

const root = process.cwd();
const svgPath = join(root, 'resources', 'icon-source.svg');
const out = join(root, 'resources', 'icon.ico');
const sizes = [16, 24, 32, 48, 64, 128, 256];

if (!existsSync(svgPath)) {
  console.error(`generate-icon: missing ${svgPath}`);
  process.exit(1);
}

const svg = readFileSync(svgPath);
const pngBuffers = await Promise.all(
  sizes.map((size) =>
    sharp(svg, { density: 288 })
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer(),
  ),
);

const ico = await toIco(pngBuffers);
if (existsSync(out)) unlinkSync(out);
writeFileSync(out, ico);
console.log(`generate-icon: wrote ${out} (${ico.length} bytes, sizes ${sizes.join(', ')})`);
