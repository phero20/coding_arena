/**
 * parsers/cargo.parser.ts
 *
 * Parses `cargo test` stdout output for Rust.
 *
 * Typical cargo test output:
 *
 *   running 3 tests
 *   test hello_world ... ok
 *   test leap ... FAILED
 *   test grains ... ok
 *   test skipped_test ... ignored
 *
 *   failures:
 *
 *   ---- leap stdout ----
 *   thread 'leap' panicked at 'assertion failed: `(left == right)`
 *     left: `false`,
 *    right: `true`', src/lib.rs:10:5
 *
 *   failures:
 *       leap
 *
 *   test result: FAILED. 2 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out
 *
 * Compile error:
 *   error[E0425]: cannot find value `x` in this scope
 */

import type { ExerciseRunResult, TestFailure } from "../types";

/** Escape a string for safe use inside a RegExp pattern. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseCargo(stdout: string): ExerciseRunResult {
  const raw = stdout ?? "";

  // ── Compile error ─────────────────────────────────────────────────────────
  // Rust compile errors start with "error[" or "error:" and there is no
  // "test result:" summary line (which only appears after successful compilation)
  if (/^error(\[E\d+\])?:/m.test(raw) && !/^test result:/m.test(raw)) {
    return {
      passed: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      compileError: raw.trim(),
      failures: [],
      rawOutput: raw,
    };
  }

  // ── Summary line: "test result: FAILED. 2 passed; 1 failed; 0 ignored" ───
  const summaryMatch = raw.match(
    /^test result:\s+\w+\.\s+(\d+)\s+passed;\s+(\d+)\s+failed(?:;\s+(\d+)\s+ignored)?/m,
  );

  let passedTests = 0;
  let failedTests = 0;
  // ignored tests are tracked but not counted as failures
  let ignoredTests = 0;

  if (summaryMatch) {
    passedTests = parseInt(summaryMatch[1], 10);
    failedTests = parseInt(summaryMatch[2], 10);
    ignoredTests = summaryMatch[3] ? parseInt(summaryMatch[3], 10) : 0;
  } else {
    // Fallback: count individual result lines
    passedTests = (raw.match(/\.\.\. ok$/gm) ?? []).length;
    failedTests = (raw.match(/\.\.\. FAILED$/gm) ?? []).length;
    ignoredTests = (raw.match(/\.\.\. ignored$/gm) ?? []).length;
  }

  const totalTests = passedTests + failedTests;

  // ── Individual failures ───────────────────────────────────────────────────
  const failures: TestFailure[] = [];

  // "test test_name ... FAILED"
  const failLinePattern = /^test\s+(\S+)\s+\.\.\.\s+FAILED$/gm;
  let match: RegExpExecArray | null;

  while ((match = failLinePattern.exec(raw)) !== null) {
    const testName = match[1].trim();

    // Find the failure block: "---- testName stdout ----"
    // Escape the test name so special chars (e.g. "::", "<", ">") don't break the regex
    const escapedName = escapeRegExp(testName);
    const blockPattern = new RegExp(
      `---- ${escapedName} stdout ----([\s\S]*?)(?=---- |failures:|test result:)`,
    );
    const blockMatch = blockPattern.exec(raw);
    const message = blockMatch
      ? blockMatch[1].trim().split("\n").slice(0, 5).join("\n")
      : "Test failed";

    failures.push({ testName, message });
  }

  return {
    passed: failedTests === 0 && totalTests > 0,
    totalTests,
    passedTests,
    failedTests,
    compileError: null,
    failures,
    rawOutput: raw,
  };
}
