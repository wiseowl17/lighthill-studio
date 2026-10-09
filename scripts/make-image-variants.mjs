#!/usr/bin/env node
/**
 * Write smaller WebP copies (`name-480.webp`, `name-800.webp`) next to every
 * full-size `public/images/**\/name.webp`, so <Photo sizes="…"> can serve a
 * thumbnail-sized file instead of the 1200px original.
 *
 * Run locally after adding photos (needs ffmpeg with libwebp on PATH), then
 * commit the new files. Vercel's build does not run this.
 *
 *   node scripts/make-image-variants.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export const VARIANT_WIDTHS = [480, 800];
const root = join(process.cwd(), "public/images");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const originals = walk(root).filter(
  (file) => file.endsWith(".webp") && !/-\d+\.webp$/.test(file),
);

let written = 0;
for (const src of originals) {
  for (const width of VARIANT_WIDTHS) {
    const out = src.replace(/\.webp$/, `-${width}.webp`);
    if (existsSync(out)) continue;
    execFileSync("ffmpeg", [
      "-v", "error", "-y", "-i", src,
      // Never upscale: a 640px source keeps 640px in its "-800" file.
      "-vf", `scale='min(${width},iw)':-2`,
      "-c:v", "libwebp", "-quality", "78", "-compression_level", "6",
      out,
    ]);
    written += 1;
  }
}
console.log(`[variants] ${originals.length} originals, ${written} files written.`);
