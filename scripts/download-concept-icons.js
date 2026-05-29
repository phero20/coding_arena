#!/usr/bin/env node

import { mkdir, readdir, writeFile, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const configDir = path.join(repoRoot, 'data', 'static-data', 'academy', 'config');
// Save concept exercise icons into the same folder used for practice icons
const outputRootDir = path.join(repoRoot, 'web', 'public', 'assets', 'practice-icon');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function readJson(filePath) {
  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function fetchWithRetry(url, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; coding-arena-icon-fetcher/1.0)',
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/svg+xml,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await delay(500 * attempt);
      }
    }
  }

  throw lastError;
}

function extractIconUrl(pageHtml) {
  const matches = pageHtml.match(/https:\/\/assets\.exercism\.org\/exercises\/[^"'<>\s]+\.svg/gi);
  return matches?.[0] ?? null;
}

async function resolveIconSvg(trackSlug, exerciseSlug) {
  const directUrl = `https://assets.exercism.org/exercises/${exerciseSlug}.svg`;

  try {
    const svg = await fetchWithRetry(directUrl, 2);
    return { svg, sourceUrl: directUrl };
  } catch {
    const exercisePageUrl = `https://exercism.org/tracks/${trackSlug}/exercises/${exerciseSlug}`;
    const pageHtml = await fetchWithRetry(exercisePageUrl, 2);
    const iconUrl = extractIconUrl(pageHtml);

    if (!iconUrl) {
      throw new Error(`Could not find icon URL for ${trackSlug}/${exerciseSlug}`);
    }

    const svg = await fetchWithRetry(iconUrl, 2);
    return { svg, sourceUrl: iconUrl };
  }
}

async function main() {
  await mkdir(outputRootDir, { recursive: true });

  const configFiles = (await readdir(configDir)).filter((fileName) => fileName.endsWith('.json'));
  const seen = new Set();
  const summary = [];

  for (const fileName of configFiles) {
    const trackSlug = path.basename(fileName, '.json');
    const configPath = path.join(configDir, fileName);
    const config = await readJson(configPath);
    const conceptExercises = Array.isArray(config?.exercises?.concept) ? config.exercises.concept : [];

    if (!conceptExercises.length) {
      continue;
    }

    console.log(`\n${trackSlug}: ${conceptExercises.length} concept exercises`);

    for (const exercise of conceptExercises) {
      const exerciseSlug = exercise?.slug;
      if (!exerciseSlug) continue;

      const key = `${trackSlug}/${exerciseSlug}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const trackOutputDir = path.join(outputRootDir, trackSlug);
      const outputFileName = `${exerciseSlug}.svg`;
      const outputPath = path.join(trackOutputDir, outputFileName);

      try {
        await mkdir(trackOutputDir, { recursive: true });

        // If file already exists, skip
        try {
          await stat(outputPath);
          console.log(`  exists ${outputFileName}, skipping`);
          continue;
        } catch (err) {
          // file does not exist, proceed
        }

        const { svg, sourceUrl } = await resolveIconSvg(trackSlug, exerciseSlug);
        await writeFile(outputPath, svg, 'utf8');
        summary.push({ trackSlug, exerciseSlug, outputFileName, sourceUrl });
        console.log(`  saved ${outputFileName}`);
      } catch (error) {
        console.error(`  failed ${key}: ${error.message}`);
      }
    }
  }

  console.log(`\nDone. Saved ${summary.length} icons to ${outputRootDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
