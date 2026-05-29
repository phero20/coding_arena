#!/usr/bin/env node

/**
 * patch-exercise-ids.js
 *
 * Iterates over every already-downloaded exercise JSON file under
 *   data/static-data/academy/exercises/{trackSlug}/{exerciseSlug}.json
 * and patches in a globally-unique `id` field of the form:
 *   "{trackSlug}:{exerciseSlug}"
 *
 * e.g.  python:hello-world
 *       java:hello-world      ← different from python one, always unique
 *
 * Safe to re-run — it is idempotent (re-writing the same id value is a no-op).
 *
 * Usage:
 *   node scripts/patch-exercise-ids.js
 *   node scripts/patch-exercise-ids.js --track=python   # only one track
 *   node scripts/patch-exercise-ids.js --dry-run        # preview, no writes
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const repoRoot   = path.resolve(__dirname, '..');

const exercisesDir = path.join(repoRoot, 'data', 'static-data', 'academy', 'exercises');

const DRY_RUN   = process.argv.includes('--dry-run');
const ONLY_TRACK = process.argv.find((a) => a.startsWith('--track='))?.split('=')[1];

async function main() {
  const trackDirs = (await readdir(exercisesDir, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => !ONLY_TRACK || name === ONLY_TRACK)
    .sort();

  let patched  = 0;
  let skipped  = 0;
  let failed   = 0;

  for (const trackSlug of trackDirs) {
    const trackDir = path.join(exercisesDir, trackSlug);

    const files = (await readdir(trackDir))
      .filter((f) => f.endsWith('.json'))
      .sort();

    if (!files.length) continue;

    console.log(`\n[${trackSlug}] ${files.length} exercises`);

    for (const fileName of files) {
      const exerciseSlug = path.basename(fileName, '.json');
      const filePath     = path.join(trackDir, fileName);

      // Generate the unique composite ID
      const id = `${trackSlug}:${exerciseSlug}`;

      try {
        const raw  = await readFile(filePath, 'utf8');
        const data = JSON.parse(raw);

        // Already has the correct id — skip to avoid unnecessary writes
        if (data.id === id) {
          process.stdout.write(`  skip  ${exerciseSlug}\n`);
          skipped++;
          continue;
        }

        // Inject `id` as the very first key so it's easy to spot in the file
        const patched_data = { id, ...data };

        if (!DRY_RUN) {
          await writeFile(filePath, JSON.stringify(patched_data, null, 2), 'utf8');
        }

        process.stdout.write(`  ${DRY_RUN ? '[dry] ' : ''}patch ${exerciseSlug} → ${id}\n`);
        patched++;
      } catch (err) {
        process.stdout.write(`  FAILED ${exerciseSlug}\n`);
        console.error(`    [error] ${id}: ${err.message}`);
        failed++;
      }
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Done${DRY_RUN ? ' (dry-run, nothing written)' : ''}.`);
  console.log(`  Patched: ${patched}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  Dir:     ${exercisesDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
