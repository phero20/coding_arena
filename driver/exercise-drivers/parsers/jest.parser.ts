/**
 * parsers/jest.parser.ts
 *
 * Parses Jest (JavaScript/TypeScript) stdout output.
 *
 * Typical Jest output:
 *
 *   PASS ./hello-world.test.js
 *   FAIL ./hello-world.test.js
 *     ● Hello World › says hello world
 *       expect(received).toEqual(expected)
 *       Expected: "Hello, World!"
 *       Received: "Goodbye, Mars!"
 *
 *   Tests:       1 failed, 2 passed, 3 total
 *   Test Suites: 1 failed, 1 total
 *
 * Compile/syntax errors:
 *   SyntaxError: Unexpected token
 *   Jest encountered an unexpected token
 */

import type { ExerciseRunResult, TestFailure } from "../types";

export function parseJest(stdout: string): ExerciseRunResult {
  const raw = stdout ?? "";

  // ── Compile / syntax error ────────────────────────────────────────────────
  if (
    /SyntaxError|Jest encountered an unexpected token|Cannot find module|ReferenceError/.test(
      raw,
    )
  ) {
    const errorLine =
      raw.match(/(SyntaxError|ReferenceError|Cannot find module)[^\n]*/)?.[0] ??
      "Syntax or module error";
    return {
      passed: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      compileError: errorLine.trim(),
      failures: [],
      rawOutput: raw,
    };
  }

  // ── Summary line: "Tests: X passed, Y failed, Z total" ───────────────────
  // This format is produced by both the real Jest runner and our injected shim.
  const summaryMatch = raw.match(/Tests:\s+(.*)/);
  let passedTests = 0;
  let failedTests = 0;
  let totalTests = 0;

  if (summaryMatch) {
    const summary = summaryMatch[1];
    const passedMatch = summary.match(/(\d+)\s+passed/);
    const failedMatch = summary.match(/(\d+)\s+failed/);
    const totalMatch = summary.match(/(\d+)\s+total/);

    passedTests = passedMatch ? parseInt(passedMatch[1], 10) : 0;
    failedTests = failedMatch ? parseInt(failedMatch[1], 10) : 0;
    totalTests = totalMatch ? parseInt(totalMatch[1], 10) : passedTests + failedTests;
  }

  // ── Individual failures ───────────────────────────────────────────────────
  // Shim format:  "  ✗ Suite > test name\n    error message"
  // Jest format:  "  ● Suite name › test name"
  const failures: TestFailure[] = [];

  // Shim failures (✗ lines)
  const shimPattern = /^\s+✗\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = shimPattern.exec(raw)) !== null) {
    const testName = match[1].trim();
    const afterHeader = raw.slice(match.index + match[0].length);
    const message = afterHeader
      .split("\n")
      .slice(0, 3)
      .map((l) => l.trim())
      .filter(Boolean)
      .join(" ");
    failures.push({ testName, message: message || "Test failed" });
  }

  // Real Jest failures (● lines) — only if no shim failures found
  if (failures.length === 0) {
    const failureHeaderPattern = /^\s+●\s+(.+)$/gm;
    while ((match = failureHeaderPattern.exec(raw)) !== null) {
      const testName = match[1].trim();
      const afterHeader = raw.slice(match.index + match[0].length);
      const messageLines = afterHeader
        .split("\n")
        .slice(1, 8)
        .filter((l) => l.trim())
        .join("\n");
      failures.push({ testName, message: messageLines.trim() || "Test failed" });
    }
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
