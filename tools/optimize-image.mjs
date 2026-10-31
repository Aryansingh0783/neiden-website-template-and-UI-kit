/**
 * Re-encodes a JPEG in place when that makes it clearly smaller (at least 15 percent) without shrinking its dimensions.
 * Needs ffmpeg on the machine that runs the importer; without it the file is left alone.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

export function optimizeJpeg(file, { minBytes = 120_000, quality = 5 } = {}) {
  try {
    const before = fs.statSync(file).size;
    if (before < minBytes) return { file, before, after: before, skipped: true };
    const tmp = `${file}.opt.jpg`;
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-q:v', String(quality), '-map_metadata', '-1', tmp]);
    const after = fs.statSync(tmp).size;
    if (after <= before * 0.85) { fs.renameSync(tmp, file); return { file, before, after, skipped: false }; }
    fs.rmSync(tmp, { force: true });
    return { file, before, after: before, skipped: true };
  } catch { return { file, skipped: true }; }
}
