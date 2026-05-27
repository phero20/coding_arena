import { CombineOptions, CombineResult } from "./types";
import { getTrackConfig } from "./language-map";

import { combinePython } from "./combiner/python";
import { combineJavaScript } from "./combiner/javascript";
import { combineJava } from "./combiner/java";
import { combineGo } from "./combiner/go";
import { combineRust } from "./combiner/rust";
import { combineRuby } from "./combiner/ruby";
import { combineCSharp } from "./combiner/csharp";
import { combineC, combineCpp } from "./combiner/c_cpp";
import { combineBash } from "./combiner/bash";

// ─── Strategy map ────────────────────────────────────────────────────────────

type CombineStrategy = (opts: CombineOptions) => string;

const COMBINE_STRATEGIES: Record<string, CombineStrategy> = {
  python: combinePython,
  javascript: combineJavaScript,
  typescript: combineJavaScript, // same test runner
  java: combineJava,
  go: combineGo,
  rust: combineRust,
  ruby: combineRuby,
  csharp: combineCSharp,
  c: combineC,
  cpp: combineCpp,
  bash: combineBash,
};

/**
 * Extra compiler options required per-track that cannot be expressed as source
 * code changes (e.g. preprocessor defines, rustc flags).
 */
const TRACK_COMPILER_OPTIONS: Partial<Record<string, string>> = {
  // rustc --test compiles + runs #[cfg(test)] blocks without cargo
  rust: "--test",
  // Define EXERCISM_RUN_ALL_TESTS so ALL Catch2 tests run (not just the first),
  // and EXERCISM_TEST_SUITE so the system Catch2 header is used instead of the
  // local test/catch.hpp which does not exist on Judge0.
  cpp: "-DEXERCISM_RUN_ALL_TESTS -DEXERCISM_TEST_SUITE",
  // Run ALL Exercism Python tests (no hidden-test gating in pytest, but keep
  // the entry here for future use)
  // python: "",
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Combines user code and exercism test code into a Judge0-ready package.
 *
 * @throws {Error} if the track is not supported (caller should route to AI judge)
 *
 * @example
 * const result = combine({
 *   trackSlug: "python",
 *   exerciseSlug: "hello-world",
 *   userCode: "def hello(): return 'Hello, World!'",
 *   testCode: "from hello_world import hello\ndef test_hello(): assert hello() == 'Hello, World!'",
 * });
 * // result.sourceCode → combined file ready for Judge0
 * // result.languageId → 71 (Python)
 */
export function combine(opts: CombineOptions): CombineResult {
  const trackConfig = getTrackConfig(opts.trackSlug);

  if (!trackConfig) {
    throw new Error(
      `Track "${opts.trackSlug}" is not supported by Judge0. Route to AI judge instead.`,
    );
  }

  const strategy = COMBINE_STRATEGIES[opts.trackSlug.toLowerCase()];

  if (!strategy) {
    throw new Error(
      `No combine strategy found for track "${opts.trackSlug}". ` +
        `Add it to COMBINE_STRATEGIES in combiner.ts.`,
    );
  }

  const sourceCode = strategy(opts);
  const compilerOptions = TRACK_COMPILER_OPTIONS[opts.trackSlug.toLowerCase()];

  return {
    sourceCode,
    languageId: trackConfig.judge0Id,
    ...(compilerOptions ? { compilerOptions } : {}),
  };
}
