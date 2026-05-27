/**
 * parsers/catch2.parser.ts
 *
 * Parses the custom Catch2-compatible shim output injected by the C++ combiner.
 *
 * Shim output format:
 *
 *   PASSED: test case name
 *   FAILED: test case name
 *     reason: message
 *   Tests: X passed, Y failed, Z total
 *
 * Compile error (no summary line present):
 *   hello_world.cpp:5:3: error: 'x' was not declared
 */

import type { ExerciseRunResult, TestFailure } from "../types";

export function parseCatch2(stdout: string): ExerciseRunResult {
  const raw = stdout ?? "";

  // ── Compile error ─────────────────────────────────────────────────────────
  // Compile errors contain "file.cpp:line:col: error:" but no summary line.
  const hasSummary = /^Tests:\s*\d+\s+passed,\s*\d+\s+failed,\s*\d+\s+total/m.test(raw);
  if (/\.cpp:\d+:\d+:\s+error:/.test(raw) && !hasSummary) {
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

  // ── Summary line: "Tests: X passed, Y failed, Z total" ───────────────────
  let passedTests = 0;
  let failedTests = 0;
  let totalTests = 0;

  const summaryMatch = raw.match(
    /^Tests:\s*(\d+)\s+passed,\s*(\d+)\s+failed,\s*(\d+)\s+total/m,
  );
  if (summaryMatch) {
    passedTests = parseInt(summaryMatch[1], 10);
    failedTests = parseInt(summaryMatch[2], 10);
    totalTests = parseInt(summaryMatch[3], 10);
  }

  // ── Edge case: zero tests ─────────────────────────────────────────────────
  if (totalTests === 0 && !hasSummary) {
    return {
      passed: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      compileError: "No tests were run.",
      failures: [],
      rawOutput: raw,
    };
  }

  // ── Individual failures ───────────────────────────────────────────────────
  // Shim format:
  //   FAILED: test case name
  //     reason: message
  const failures: TestFailure[] = [];
  const failPattern = /^FAILED:\s*(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = failPattern.exec(raw)) !== null) {
    const testName = match[1].trim();

    // The reason line immediately follows: "  reason: message"
    const afterMatch = raw.slice(match.index + match[0].length);
    const reasonMatch = afterMatch.match(/^\s+reason:\s*(.+)$/m);
    const message = reasonMatch ? reasonMatch[1].trim() : "Test failed";

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
