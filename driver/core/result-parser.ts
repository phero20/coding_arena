/**
 * driver/core/result-parser.ts
 *
 * Universal Result Parser — Approach A (single Judge0 submission, all test cases in one stdin).
 *
 * The Driver emits one of two line formats per test case:
 *
 *   SUCCESS:
 *     @@RESULT@@:<actual> @@EXPECTED@@:<expected> @@PASS@@:<true|false> @@TIME@@:<ms>
 *
 *   RUNTIME ERROR (caught by driver try/catch):
 *     @@ERROR@@:case=<N> phase=<phase> msg=<ClassName>:<message>
 *
 * This parser is language-agnostic — Java, Python, C++ all use the same tags.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Public Types
// ─────────────────────────────────────────────────────────────────────────────

export type ExecutionVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "SYSTEM_ERROR";

/**
 * The result of a single test case as parsed from driver stdout.
 */
export interface TestCaseResult {
  /** 0-based index matching the original testCases array. */
  index: number;

  /** Whether this test case was accepted. */
  passed: boolean;

  /** Per-test verdict. */
  status: ExecutionVerdict;

  /**
   * Serialized actual output produced by the user's code.
   * e.g. "[1,2]", "null", "true", "[null,null,1,-1]"
   */
  actual: string | null;

  /**
   * Serialized expected output.
   * null when a runtime error prevented execution.
   */
  expected: string | null;

  /**
   * Wall-clock execution time in milliseconds reported by the driver.
   * Does NOT include JVM startup time.
   */
  executionTimeMs: number;

  /**
   * Which phase of the driver loop threw the error.
   * Possible values: "parse_inputs" | "parse_expected" | "invoke" | "compare"
   */
  errorPhase?: string;

  /**
   * Human-readable error message (e.g. "NullPointerException:null").
   */
  errorMessage?: string;
}

/**
 * The full parsed result of a complete Driver + Judge0 execution.
 */
export interface DriverParseResult {
  /** Overall submission verdict. First non-ACCEPTED test case wins. */
  verdict: ExecutionVerdict;

  /** Per-test-case breakdown, sorted by index. */
  tests: TestCaseResult[];

  /** Number of test cases that passed. */
  passedCount: number;

  /** Total number of test cases that were expected. */
  totalCount: number;

  /** Sum of all per-case execution times in milliseconds. */
  totalTimeMs: number;

  /** Compilation error string. Set only when verdict === "COMPILE_ERROR". */
  compilationError?: string;

  /**
   * Set when the process crashed without producing output or when stderr
   * contains a meaningful message. Useful for surfacing JVM OOM, SIGSEGV, etc.
   */
  systemError?: string;

  /** Raw peak memory usage in KB as reported by Judge0. */
  memoryKb?: number;

  /**
   * Non-fatal parser diagnostics (unknown/malformed lines, duplicate indices).
   * Useful for debugging noisy stdout without failing the whole submission.
   */
  parsingWarnings?: string[];
}

/**
 * The subset of Judge0 fields the parser needs.
 * Matches Judge0SubmissionResult from judge0.service.ts.
 */
export interface RawJudge0Result {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  time?: string | null;
  memory?: number | null;
  status: {
    id: number;
    description: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal Regex
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Matches: @@RESULT@@:<actual> @@EXPECTED@@:<expected> @@PASS@@:<bool> @@TIME@@:<ms>
 * Groups:   1=actual  2=expected  3=true|false  4=time_ms
 */
const RESULT_RE =
  /^@@RESULT@@:(.+?) @@EXPECTED@@:(.+?) @@PASS@@:(true|false) @@TIME@@:([\d.]+)$/;

/**
 * Matches: @@ERROR@@:case=<N> phase=<word> msg=<rest>
 * Groups:   1=caseIdx  2=phase  3=message
 */
const ERROR_RE = /^@@ERROR@@:case=(\d+) phase=(\S+) msg=(.+)$/;

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map a Judge0 non-accepted status ID to our verdict enum.
 * Status IDs 7-12 are all various runtime signal errors.
 */
function mapStatusId(id: number): ExecutionVerdict {
  switch (id) {
    case 5:
      return "TIME_LIMIT_EXCEEDED";
    case 6:
      return "COMPILE_ERROR";
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
      return "RUNTIME_ERROR";
    case 13:
    case 14:
    default:
      return "SYSTEM_ERROR";
  }
}

/** Build a safe error string from any available Judge0 error field. */
function extractErrorText(raw: RawJudge0Result): string {
  return [raw.compile_output, raw.stderr, raw.status.description]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(" | ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse raw Judge0 output into a fully structured DriverParseResult.
 *
 * @param raw        Raw Judge0 submission result object.
 * @param totalCount The number of test cases expected (DriverOptions.testCases.length).
 *                   Used to detect silently missing cases.
 */
export function parseDriverResult(
  raw: RawJudge0Result,
  totalCount: number,
): DriverParseResult {
  const memoryKb = raw.memory ?? undefined;
  const parsingWarnings: string[] = [];

  // ── 1. Compilation Error ──────────────────────────────────────────────────
  // Judge0 status 6 = compilation error. stdout will be empty.
  if (raw.status.id === 6) {
    return {
      verdict: "COMPILE_ERROR",
      tests: [],
      passedCount: 0,
      totalCount,
      totalTimeMs: 0,
      compilationError: extractErrorText(raw) || "Compilation failed",
      memoryKb,
      parsingWarnings,
    };
  }

  // ── 2. TLE at Judge0 (process wall-clock limit hit) ─────────────────────
  // The driver loop was killed before finishing. We can't isolate which case
  // caused it, so mark all expected cases as TLE.
  if (raw.status.id === 5) {
    const tests: TestCaseResult[] = Array.from(
      { length: totalCount },
      (_, i) => ({
        index: i,
        passed: false,
        status: "TIME_LIMIT_EXCEEDED" as const,
        actual: null,
        expected: null,
        executionTimeMs: 0,
      }),
    );
    return {
      verdict: "TIME_LIMIT_EXCEEDED",
      tests,
      passedCount: 0,
      totalCount,
      totalTimeMs: 0,
      memoryKb,
      parsingWarnings,
    };
  }

  // ── 3. Hard crash with no stdout (JVM OOM, SIGSEGV, etc.) ────────────────
  const stdout = (raw.stdout ?? "").trim();
  if (!stdout) {
    const verdict = mapStatusId(raw.status.id);
    return {
      verdict,
      tests: [],
      passedCount: 0,
      totalCount,
      totalTimeMs: 0,
      systemError: extractErrorText(raw) || "Process terminated without producing output",
      memoryKb,
      parsingWarnings,
    };
  }

  // ── 4. Parse stdout line by line ──────────────────────────────────────────
  const lines = stdout.split("\n").map((l) => l.trim()).filter(Boolean);
  const tests: TestCaseResult[] = [];

  // Sequential counter for @@RESULT@@ lines (they carry no index tag).
  // @@ERROR@@ lines carry an explicit case index.
  let nextResultIndex = 0;

  for (const line of lines) {
    // ── 4a. SUCCESS line ──────────────────────────────────────────────────
    const resultMatch = RESULT_RE.exec(line);
    if (resultMatch) {
      const [, actual, expected, passStr, timeStr] = resultMatch;
      const passed = passStr === "true";
      tests.push({
        index: nextResultIndex,
        passed,
        status: passed ? "ACCEPTED" : "WRONG_ANSWER",
        actual: actual.trim(),
        expected: expected.trim(),
        executionTimeMs: parseFloat(timeStr) || 0,
      });
      nextResultIndex++;
      continue;
    }

    // ── 4b. ERROR line ─────────────────────────────────────────────────────
    const errorMatch = ERROR_RE.exec(line);
    if (errorMatch) {
      const [, caseStr, phase, msg] = errorMatch;
      const idx = parseInt(caseStr, 10);
      tests.push({
        index: idx,
        passed: false,
        status: "RUNTIME_ERROR",
        actual: null,
        expected: null,
        executionTimeMs: 0,
        errorPhase: phase,
        errorMessage: msg.trim(),
      });
      // Advance the sequential counter past this index so the next @@RESULT@@
      // line gets the correct index even after an error.
      nextResultIndex = idx + 1;
      continue;
    }

    // Unknown/malformed line — defensive skip (e.g. debug prints in user code)
    parsingWarnings.push(`Ignored non-driver line: "${line.slice(0, 160)}"`);
  }

  // ── 5. Detect silently missing cases ─────────────────────────────────────
  // If the process produced fewer lines than expected (mid-loop crash),
  // fill in the missing test cases as SYSTEM_ERROR.
  const seenIndices = new Set(tests.map((t) => t.index));
  for (let i = 0; i < totalCount; i++) {
    if (!seenIndices.has(i)) {
      tests.push({
        index: i,
        passed: false,
        status: "SYSTEM_ERROR",
        actual: null,
        expected: null,
        executionTimeMs: 0,
        errorMessage: "No output produced for this case — process may have crashed mid-loop",
      });
    }
  }

  // ── 6. Sort by index & compute aggregate values ───────────────────────────
  tests.sort((a, b) => a.index - b.index);

  // Detect duplicate indices and keep first-seen entry stable.
  // Duplicates can happen if user prints forged markers.
  const deduped: TestCaseResult[] = [];
  const seen = new Set<number>();
  for (const t of tests) {
    if (seen.has(t.index)) {
      parsingWarnings.push(`Duplicate test index in stdout markers: ${t.index}`);
      continue;
    }
    seen.add(t.index);
    deduped.push(t);
  }

  const passedCount = deduped.filter((t) => t.passed).length;
  const totalTimeMs = deduped.reduce((sum, t) => sum + t.executionTimeMs, 0);

  // Overall verdict logic:
  // 1. If any test case explicitly failed (WA or RE), that determines the verdict.
  // 2. If all tests passed but the Judge0 process itself was killed (e.g. SIGSEGV after last test),
  //    the status ID determines the verdict.
  // 3. Otherwise, ACCEPTED.
  const firstFailure = deduped.find((t) => !t.passed);
  let verdict: ExecutionVerdict = "ACCEPTED";

  if (firstFailure && firstFailure.status !== "SYSTEM_ERROR") {
    // Priority 1: Explicit test failure (WA/RE)
    verdict = firstFailure.status;
  } else if (raw.status.id > 4) {
    // Priority 2: Process-level crash (SIGSEGV, etc.)
    verdict = mapStatusId(raw.status.id);
  } else if (firstFailure) {
    // Priority 3: Missing output / Driver crash (SYSTEM_ERROR)
    verdict = firstFailure.status;
  }

  // Attach any stderr as a system-level note (doesn't change verdict).
  const systemError = raw.stderr?.trim() || undefined;

  return {
    verdict,
    tests: deduped,
    passedCount,
    totalCount,
    totalTimeMs,
    memoryKb,
    ...(systemError ? { systemError } : {}),
    ...(parsingWarnings.length ? { parsingWarnings } : {}),
  };
}
