/**
 * parsers/junit.parser.ts
 *
 * Parses the custom JUnit-shim output produced by combiner/java.ts.
 *
 * Output format:
 *   PASSED: ClassName#methodName
 *   FAILED: ClassName#methodName
 *     reason: message
 *   Tests: X passed, Y failed, Z total
 *
 * Compile errors:
 *   error: cannot find symbol
 *   HelloWorldTest.java:5: error: ...
 *   class HelloWorldTest is public, should be declared in a file named ...
 */

import type { ExerciseRunResult, TestFailure } from "../types";

export function parseJUnit(stdout: string): ExerciseRunResult {
  const raw = stdout ?? "";

  // ── Compile error ─────────────────────────────────────────────────────────
  // Java compile errors: "error:" lines, "cannot find symbol", or public class mismatch
  if (
    /\berror:/.test(raw) &&
    !/^Tests:\s+\d+/m.test(raw)
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

  // ── Summary line: "Tests: X passed, Y failed, Z total" ───────────────────
  const summaryMatch = raw.match(
    /^Tests:\s+(\d+)\s+passed,\s+(\d+)\s+failed,\s+(\d+)\s+total/m,
  );

  let passedTests = 0;
  let failedTests = 0;
  let totalTests = 0;

  if (summaryMatch) {
    passedTests = parseInt(summaryMatch[1], 10);
    failedTests = parseInt(summaryMatch[2], 10);
    totalTests = parseInt(summaryMatch[3], 10);
  } else {
    // Fallback: count PASSED/FAILED lines
    passedTests = (raw.match(/^PASSED:/gm) ?? []).length;
    failedTests = (raw.match(/^FAILED:/gm) ?? []).length;
    totalTests = passedTests + failedTests;
  }

  // ── Individual failures ───────────────────────────────────────────────────
  // Format:
  //   FAILED: ClassName#methodName
  //     reason: message
  const failures: TestFailure[] = [];
  const failPattern = /^FAILED:\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = failPattern.exec(raw)) !== null) {
    const testName = match[1].trim();
    const afterMatch = raw.slice(match.index + match[0].length);
    const reasonMatch = afterMatch.match(/^\s+reason:\s+(.+)$/m);
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
