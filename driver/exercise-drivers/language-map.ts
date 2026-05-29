/**
 * exercises-driver/language-map.ts
 *
 * Maps exercism track slugs to:
 *   - Judge0 language ID (if supported)
 *   - Which test runner / parser to use
 *   - Which combiner strategy to use
 *
 * If a track slug is NOT in this map → fall back to AI judge.
 */

export type TestRunner =
  | "pytest"      // Python
  | "jest"        // JavaScript, TypeScript, CoffeeScript
  | "junit"       // Java, Kotlin, Scala, Groovy
  | "gotest"      // Go
  | "cargo"       // Rust
  | "rspec"       // Ruby
  | "dotnet"      // C#, F#, VB.NET
  | "unity"       // C (Unity test framework)
  | "catch2"      // C++
  | "bash"        // Bash (bats test runner)

export interface TrackConfig {
  /** Judge0 language ID */
  judge0Id: number;
  /** Which test runner this track uses */
  testRunner: TestRunner;
  /**
   * File extension for the user's solution file.
   * Used by the combiner to name the file correctly when Judge0 needs it.
   */
  fileExtension: string;
}

/**
 * All exercism tracks that Judge0 can execute.
 * Tracks NOT listed here are routed to the AI judge.
 */
export const SUPPORTED_TRACKS: Record<string, TrackConfig> = {
  // ── Python ────────────────────────────────────────────────────────────────
  python: {
    judge0Id: 71,
    testRunner: "pytest",
    fileExtension: ".py",
  },

  // ── JavaScript ────────────────────────────────────────────────────────────
  javascript: {
    judge0Id: 63,
    testRunner: "jest",
    fileExtension: ".js",
  },

  // ── TypeScript ────────────────────────────────────────────────────────────
  typescript: {
    judge0Id: 74,
    testRunner: "jest",
    fileExtension: ".ts",
  },

  // ── Java ──────────────────────────────────────────────────────────────────
  java: {
    judge0Id: 62,
    testRunner: "junit",
    fileExtension: ".java",
  },

  // ── Go ────────────────────────────────────────────────────────────────────
  go: {
    judge0Id: 60,
    testRunner: "gotest",
    fileExtension: ".go",
  },

  // ── Rust ──────────────────────────────────────────────────────────────────
  rust: {
    judge0Id: 73,
    testRunner: "cargo",
    fileExtension: ".rs",
  },

  // ── Ruby ──────────────────────────────────────────────────────────────────
  ruby: {
    judge0Id: 72,
    testRunner: "rspec",
    fileExtension: ".rb",
  },

  // ── C# ────────────────────────────────────────────────────────────────────
  csharp: {
    judge0Id: 51,
    testRunner: "dotnet",
    fileExtension: ".cs",
  },

  // ── C ─────────────────────────────────────────────────────────────────────
  c: {
    judge0Id: 50,
    testRunner: "unity",
    fileExtension: ".c",
  },

  // ── C++ ───────────────────────────────────────────────────────────────────
  cpp: {
    judge0Id: 54,
    testRunner: "catch2",
    fileExtension: ".cpp",
  },

  // ── Bash ──────────────────────────────────────────────────────────────────
  bash: {
    judge0Id: 46,
    testRunner: "bash",
    fileExtension: ".sh",
  },
};

/**
 * Returns the track config for a given slug, or null if unsupported.
 * Unsupported tracks should be routed to the AI judge.
 */
export function getTrackConfig(trackSlug: string): TrackConfig | null {
  return SUPPORTED_TRACKS[trackSlug.toLowerCase()] ?? null;
}

/**
 * Returns true if the track is supported by Judge0.
 */
export function isJudge0Supported(trackSlug: string): boolean {
  return trackSlug.toLowerCase() in SUPPORTED_TRACKS;
}
