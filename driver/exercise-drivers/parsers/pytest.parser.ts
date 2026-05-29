/**
 * parsers/pytest.parser.ts
 *
 * Parses the custom unittest shim output injected by the Python combiner.
 *
 * Shim output format:
 *
 *   module.ClassName.test_method_name PASSED
 *   module.ClassName.test_method_name FAILED
 *   __main__::test_function_name PASSED
 *   __main__::test_function_name FAILED
 *   =================================== FAILURES ===================================
 *   _________________ test_name _________________
 *   <traceback / assertion error>
 *
 *   ========================= X passed, Y failed ==========================
 *
 * Compile / syntax errors (no PASSED/FAILED lines present):
 *   SyntaxError: invalid syntax
 *   IndentationError: unexpected indent
 *   NameError: name 'foo' is not defined
 *   ImportError: No module named 'foo'
 */

import type { ExerciseRunResult, TestFailure } from "../types";

export function parsePytest(stdout: string): ExerciseRunResult {
  const raw = stdout ?? "";

  // ── Compile / syntax error ────────────────────────────────────────────────
  // Detect when a hard error occurred before any tests could run.
  const hasTestLines = /\bPASSED\b|\bFAILED\b/.test(raw);
  if (
    !hasTestLines &&
    /(SyntaxError|IndentationError|NameError|ImportError)\s*:/.test(raw)
  ) {
    const errorMatch =
      raw.match(/(SyntaxError|IndentationError|NameError|ImportError)[^\n]*/)?.[0] ??
      "Syntax or import error";
    return {
      passed: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      compileError: errorMatch.trim(),
      failures: [],
      rawOutput: raw,
    };
  }

  // ── Summary line: "X passed, Y failed" ───────────────────────────────────
  // Format: "========================= X passed, Y failed =========================="
  const summaryMatch = raw.match(/(\d+)\s+passed,\s*(\d+)\s+failed/);

  let passedTests = 0;
  let failedTests = 0;

  if (summaryMatch) {
    passedTests = parseInt(summaryMatch[1], 10);
    failedTests = parseInt(summaryMatch[2], 10);
  }

  const totalTests = passedTests + failedTests;

  // ── Edge case: no tests collected ────────────────────────────────────────
  if (totalTests === 0 && !hasTestLines) {
    return {
      passed: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      compileError: "No tests were collected. Check your solution file.",
      failures: [],
      rawOutput: raw,
    };
  }

  // ── Individual FAILED test names ─────────────────────────────────────────
  // Lines like:
  //   "module.ClassName.test_method FAILED"
  //   "__main__::test_function FAILED"
  const failedLinePattern = /^(\S+)\s+FAILED$/gm;
  const failures: TestFailure[] = [];
  let match: RegExpExecArray | null;

  while ((match = failedLinePattern.exec(raw)) !== null) {
    const rawName = match[1].trim();

    // Derive a human-readable test name from the dotted/:: path
    const testName = rawName.includes("::")
      ? rawName.split("::").pop()!
      : rawName.split(".").pop()!;

    // ── Extract failure message from the _____ block ──────────────────────
    // The shim prints:
    //   _________________ test_name _________________
    //   <traceback lines>
    // followed by the next _____ block or the summary ===== line.
    const escapedTestName = testName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const blockPattern = new RegExp(
      `_{5,}\\s+${escapedTestName}\\s+_{5,}\\n([\\s\\S]*?)(?=_{5,}|={5,}|$)`,
    );
    const blockMatch = blockPattern.exec(raw);
    const message = blockMatch
      ? blockMatch[1].trim().split("\n").slice(0, 6).join("\n")
      : "Test failed";

    failures.push({ testName: rawName, message });
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
