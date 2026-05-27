#!/usr/bin/env node

/**
 * download-exercise-content.js
 *
 * Iterates over every language config in data/static-data/academy/config/
 * and for each exercise (both concept and practice) fetches from the
 * exercism GitHub repo:
 *   - instructions.md
 *   - introduction.md  (optional)
 *   - hints.md         (optional)
 *   - starter code     (the stub file the user edits)
 *   - example solution (.meta/example.* or .meta/exemplar.*)
 *   - test file
 *   - .meta/config.json (source attribution, authors, etc.)
 *
 * Output structure:
 *   data/static-data/academy/exercises/
 *     {trackSlug}/
 *       {exerciseSlug}.json   ← one file per exercise
 *
 * Re-running is safe — already-downloaded files are skipped unless
 * you pass --force.
 */

import { mkdir, readdir, writeFile, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const configDir = path.join(repoRoot, 'data', 'static-data', 'academy', 'config');
const outputRootDir = path.join(repoRoot, 'data', 'static-data', 'academy', 'exercises');

const FORCE = process.argv.includes('--force');
const ONLY_TRACK = process.argv.find((a) => a.startsWith('--track='))?.split('=')[1];
const FROM_TRACK = process.argv.find((a) => a.startsWith('--from='))?.split('=')[1];

const GITHUB_RAW = 'https://raw.githubusercontent.com/exercism';
const DELAY_BETWEEN_REQUESTS_MS = 50; // be polite to GitHub

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function readJson(filePath) {
  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch a URL and return the text body.
 * Returns null (instead of throwing) when the server returns 404,
 * so callers can treat missing optional files gracefully.
 */
async function fetchText(url, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'user-agent': 'coding-arena-content-fetcher/1.0',
          accept: 'text/plain,application/json,*/*',
        },
      });

      if (res.status === 404) return null;

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }

      return await res.text();
    } catch (err) {
      lastError = err;
      if (attempt < attempts) await delay(300 * attempt);
    }
  }

  throw lastError;
}

/**
 * Resolve the file extension pattern from the track config's `files` block.
 * e.g. "%{snake_slug}.py" → "hello_world.py"
 * e.g. "%{pascal_slug}.cs" → "HelloWorld.cs"
 *
 * Returns null if any %{...} placeholder could not be resolved,
 * which prevents malformed URLs from being fetched.
 */
function resolveFilename(pattern, slug) {
  const kebabSlug = slug;                          // already kebab-case e.g. hello-world
  const snakeSlug = slug.replace(/-/g, '_');       // hello_world
  const pascalSlug = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');                                     // HelloWorld
  const camelSlug = pascalSlug.charAt(0).toLowerCase() + pascalSlug.slice(1); // helloWorld

  const resolved = pattern
    .replace('%{kebab_slug}', kebabSlug)
    .replace('%{snake_slug}', snakeSlug)
    .replace('%{pascal_slug}', pascalSlug)
    .replace('%{camel_slug}', camelSlug)
    .replace('%{slug}', slug);

  // If any %{...} token remains, the pattern was unknown — return null
  // so the caller skips this fetch instead of building a broken URL.
  if (/%\{[^}]+\}/.test(resolved)) {
    return null;
  }

  return resolved;
}

/**
 * Build the GitHub raw base URL for an exercise.
 * concept exercises live under exercises/concept/
 * practice exercises live under exercises/practice/
 *
 * Each path segment is individually encoded so special characters
 * (e.g. parentheses, plus signs) don't corrupt the URL.
 */
function exerciseBaseUrl(trackSlug, exerciseSlug, exerciseType) {
  const folder = exerciseType === 'concept' ? 'concept' : 'practice';
  // Encode the exercise slug in case it contains characters like +, (, ), etc.
  const encodedSlug = encodeURIComponent(exerciseSlug);
  return `${GITHUB_RAW}/${encodeURIComponent(trackSlug)}/main/exercises/${folder}/${encodedSlug}`;
}

// ---------------------------------------------------------------------------
// Per-exercise fetcher
// ---------------------------------------------------------------------------

async function fetchExerciseContent(trackSlug, exercise, exerciseType, trackFilesConfig) {
  const { slug, name, uuid, blurb, difficulty, practices, prerequisites, concepts, status } = exercise;
  const base = exerciseBaseUrl(trackSlug, slug, exerciseType);

  // --- docs ---
  const [instructions, introduction, hints] = await Promise.all([
    fetchText(`${base}/.docs/instructions.md`),
    fetchText(`${base}/.docs/introduction.md`),
    fetchText(`${base}/.docs/hints.md`),
  ]);

  await delay(DELAY_BETWEEN_REQUESTS_MS);

  // --- meta config (source attribution, authors) ---
  const metaConfigRaw = await fetchText(`${base}/.meta/config.json`);
  let metaConfig = null;
  if (metaConfigRaw) {
    try {
      metaConfig = JSON.parse(metaConfigRaw);
    } catch {
      // ignore malformed meta
    }
  }

  await delay(DELAY_BETWEEN_REQUESTS_MS);

  // --- starter / solution / test files ---
  // Priority: use the exercise-specific .meta/config.json files block if it exists,
  // as some exercises have non-standard file names (e.g. Java hello-world uses
  // Greeter.java instead of HelloWorld.java). Fall back to global trackFilesConfig.

  let starterCode = null;
  let exampleSolution = null;
  let testCode = null;

  // Check if the exercise's own .meta/config.json provides explicit file paths
  const metaFiles = metaConfig?.files;

  // Resolve the effective file patterns — exercise-level takes priority over track-level
  const effectiveSolutionPath = metaFiles?.solution?.[0] ?? null;
  const effectiveTestPath     = metaFiles?.test?.[0]     ?? null;
  const effectiveExamplePath  =
    exerciseType === 'concept'
      ? (metaFiles?.exemplar?.[0] ?? null)
      : (metaFiles?.example?.[0]  ?? null);

  // Fallback patterns from the global track config (still need resolveFilename for %{...} tokens)
  const solutionPattern      = trackFilesConfig?.solution?.[0];
  const testPattern          = trackFilesConfig?.test?.[0];
  const solutionExamplePattern =
    exerciseType === 'concept'
      ? trackFilesConfig?.exemplar?.[0]
      : trackFilesConfig?.example?.[0];

  // Helper: fetch a file using either an exact path (from .meta/config.json)
  // or a pattern that needs slug substitution (from global track config).
  async function fetchCodeFile(exactPath, fallbackPattern, label) {
    if (exactPath) {
      // exactPath is already a literal relative path like "src/main/java/Greeter.java"
      const encodedPath = exactPath.split('/').map(encodeURIComponent).join('/');
      const result = await fetchText(`${base}/${encodedPath}`);
      await delay(DELAY_BETWEEN_REQUESTS_MS);
      return result;
    }

    if (fallbackPattern) {
      const filename = resolveFilename(fallbackPattern, slug);
      if (filename) {
        const encodedFilename = filename.split('/').map(encodeURIComponent).join('/');
        const result = await fetchText(`${base}/${encodedFilename}`);
        await delay(DELAY_BETWEEN_REQUESTS_MS);
        return result;
      } else {
        console.warn(`    [warn] unresolved filename pattern "${fallbackPattern}" for ${slug}, skipping ${label}`);
      }
    }

    return null;
  }

  starterCode     = await fetchCodeFile(effectiveSolutionPath, solutionPattern,      'starter code');
  exampleSolution = await fetchCodeFile(effectiveExamplePath,  solutionExamplePattern, 'example solution');
  testCode        = await fetchCodeFile(effectiveTestPath,     testPattern,           'test code');

  // --- assemble output ---
  return {
    id: `${trackSlug}:${slug}`,
    trackSlug,
    slug,
    name,
    uuid: uuid ?? null,
    type: exerciseType,
    status: status ?? null,
    blurb: blurb ?? null,
    difficulty: difficulty ?? null,
    // concept exercises have "concepts", practice exercises have "practices"
    concepts: concepts ?? null,
    practices: practices ?? null,
    prerequisites: prerequisites ?? null,
    // content
    instructions: instructions ?? null,
    introduction: introduction ?? null,
    hints: hints ?? null,
    starter_code: starterCode ?? null,
    example_solution: exampleSolution ?? null,
    test_code: testCode ?? null,
    // attribution
    source: metaConfig?.source ?? null,
    source_url: metaConfig?.source_url ?? null,
    authors: metaConfig?.authors ?? null,
    contributors: metaConfig?.contributors ?? null,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await mkdir(outputRootDir, { recursive: true });

  const configFiles = (await readdir(configDir))
    .filter((f) => f.endsWith('.json'))
    .sort();

  let totalSaved = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  let reachedFrom = !FROM_TRACK; // if no --from, start immediately

  for (const fileName of configFiles) {
    const trackSlug = path.basename(fileName, '.json');

    if (ONLY_TRACK && trackSlug !== ONLY_TRACK) continue;

    // --from=powershell: skip all tracks before powershell alphabetically
    if (!reachedFrom) {
      if (trackSlug === FROM_TRACK) {
        reachedFrom = true;
      } else {
        console.log(`\n[${trackSlug}] skipping (before --from=${FROM_TRACK})`);
        continue;
      }
    }

    const config = await readJson(path.join(configDir, fileName));
    const trackFilesConfig = config.files ?? {};

    const conceptExercises = Array.isArray(config?.exercises?.concept)
      ? config.exercises.concept
      : [];
    const practiceExercises = Array.isArray(config?.exercises?.practice)
      ? config.exercises.practice
      : [];

    const allExercises = [
      ...conceptExercises.map((e) => ({ ...e, _type: 'concept' })),
      ...practiceExercises.map((e) => ({ ...e, _type: 'practice' })),
    ];

    if (!allExercises.length) {
      console.log(`\n[${trackSlug}] no exercises found, skipping`);
      continue;
    }

    console.log(
      `\n[${trackSlug}] ${conceptExercises.length} concept + ${practiceExercises.length} practice exercises`
    );

    const trackOutputDir = path.join(outputRootDir, trackSlug);
    await mkdir(trackOutputDir, { recursive: true });

    for (const exercise of allExercises) {
      const { slug, _type: exerciseType } = exercise;
      const outputPath = path.join(trackOutputDir, `${slug}.json`);

      // skip if already downloaded (unless --force or we're in a --from range)
      if (!FORCE && !FROM_TRACK && (await fileExists(outputPath))) {
        process.stdout.write(`  skip  ${slug}\n`);
        totalSkipped++;
        continue;
      }

      try {
        process.stdout.write(`  fetch ${exerciseType.padEnd(8)} ${slug} ... `);
        const content = await fetchExerciseContent(trackSlug, exercise, exerciseType, trackFilesConfig);
        await writeFile(outputPath, JSON.stringify(content, null, 2), 'utf8');
        process.stdout.write('done\n');
        totalSaved++;
      } catch (err) {
        // Log the full error with the slug so failed exercises are easy to identify.
        // Failed exercises are NOT written to disk, so re-running the script will
        // automatically retry them (already-written files are skipped, failed ones aren't).
        process.stdout.write(`FAILED\n`);
        console.error(`    [error] ${trackSlug}/${slug}: ${err.message}`);
        totalFailed++;
      }
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Done.`);
  console.log(`  Saved:   ${totalSaved}`);
  console.log(`  Skipped: ${totalSkipped}`);
  console.log(`  Failed:  ${totalFailed}`);
  console.log(`  Output:  ${outputRootDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
