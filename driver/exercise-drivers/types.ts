/**
 * exercises-driver/types.ts
 *
 * Shared types for the exercism exercise judge system.
 * Both the combiner and all parsers use these types.
 */

// ─── Combiner ────────────────────────────────────────────────────────────────

export interface CombineOptions {
  /** The track slug, e.g. "python", "javascript", "java" */
  trackSlug: string;
  /** The exercise slug, e.g. "hello-world", "leap" */
  exerciseSlug: string;
  /** The user's submitted code */
  userCode: string;
  /** The raw test file content fetched from exercism (stored in exercise JSON) */
  testCode: string;
}

export interface CombineResult {
  /** The final source code to send to Judge0 as a single file */
  sourceCode: string;
  /** The Judge0 language ID to use */
  languageId: number;
  /**
   * Optional stdin to pass to Judge0.
   * Most exercism test runners don't need stdin, but some do.
   */
  stdin?: string;
  /**
   * Optional compiler options to pass to Judge0.
   * e.g. for C: "-lm" for math library
   */
  compilerOptions?: string;
}

// ─── Parser ──────────────────────────────────────────────────────────────────

export interface TestFailure {
  /** The test function/case name as reported by the test runner */
  testName: string;
  /** The failure message or assertion error */
  message: string;
}

export interface ExerciseRunResult {
  /** Whether all tests passed */
  passed: boolean;
  /** Total number of tests that ran */
  totalTests: number;
  /** Number of tests that passed */
  passedTests: number;
  /** Number of tests that failed */
  failedTests: number;
  /** Compile/syntax error string — null if compilation succeeded */
  compileError: string | null;
  /** List of individual test failures with names and messages */
  failures: TestFailure[];
  /** The raw stdout from Judge0 — useful for debugging */
  rawOutput: string;
}

// ─── Registry ────────────────────────────────────────────────────────────────

/** A parser function takes raw Judge0 stdout and returns a structured result */
export type ExerciseOutputParser = (stdout: string) => ExerciseRunResult;

/** A combiner function takes combine options and returns a Judge0-ready package */
export type ExerciseCombiner = (options: CombineOptions) => CombineResult;
