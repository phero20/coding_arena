/**
 * parsers/bash.parser.ts
 *
 * Parses the custom bats-compatible runner output produced by combiner/bash.ts.
 *
 * Output format:
 *   ✓ test name
 *   ✗ test name: failure message
 *   (blank line)
 *   Tests: X passed, Y failed, Z total
 *
 * Syntax / runtime errors (no summary line present):
 *   bash: syntax error near unexpected token ...
 *   command not found
 *   No such file or directory
 */

import type { ExerciseRunResult, TestFailure } from "../types";

export function parseBash(stdout: string): ExerciseRunResult {
  const raw = stdout ?? "";

  // ── Summary line ──────────────────────────────────────────────────────────
  const summaryMatch = raw.match(
    /^Tests:\s+(\d+)\s+passed,\s+(\d+)\s+failed,\s+(\d+)\s+total/m,
  );

  // ── Syntax / runtime error (no summary produced) ──────────────────────────
  if (
    !summaryMatch &&
    /syntax error|command not found|No such file/i.test(raw)
  ) {
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

  let passedTests = 0;
  let failedTests = 0;
  let totalTests = 0;

  if (summaryMatch) {
    passedTests = parseInt(summaryMatch[1], 10);
    failedTests = parseInt(summaryMatch[2], 10);
    totalTests = parseInt(summaryMatch[3], 10);
  } else {
    // Fallback: count ✓ / ✗ lines directly
    passedTests = (raw.match(/^✓ /gm) ?? []).length;
    failedTests = (raw.match(/^✗ /gm) ?? []).length;
    totalTests = passedTests + failedTests;
  }

  // ── Individual failures ───────────────────────────────────────────────────
  // Format: ✗ test name: message
  // The message may be empty (just "✗ test name")
  const failures: TestFailure[] = [];
  const failPattern = /^✗ (.+?)(?::\s*(.*))?$/gm;
  let match: RegExpExecArray | null;

  while ((match = failPattern.exec(raw)) !== null) {
    const testName = match[1].trim();
    const message = (match[2] ?? "").trim() || "Test failed";
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
