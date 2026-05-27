/**
 * parsers/rspec.parser.ts
 *
 * Parses both RSpec and Minitest (Ruby) stdout output.
 *
 * ── RSpec format ─────────────────────────────────────────────────────────────
 *   .F.
 *
 *   Failures:
 *     1) HelloWorld#hello says hello world
 *        Failure/Error: expect(hello).to eq("Hello, World!")
 *          expected: "Hello, World!"
 *               got: "Goodbye, Mars!"
 *
 *   Finished in 0.00234 seconds (files took 0.12 seconds to load)
 *   3 examples, 1 failure
 *
 * ── Minitest format ──────────────────────────────────────────────────────────
 *   Run options: --seed 12345
 *   Running:
 *   ..F.
 *   Finished in 0.001234s, 3241.1 runs/s, 3241.1 assertions/s.
 *   4 runs, 4 assertions, 1 failures, 0 errors, 0 skips
 *
 *   Failures:
 *     1) Failure:
 *   HelloWorldTest#test_say_hi [hello_world_test.rb:10]:
 *   Expected: "Hello, World!"
 *     Actual: "Goodbye, Mars!"
 *
 * ── Compile / syntax errors ───────────────────────────────────────────────────
 *   SyntaxError, LoadError, NameError — without a summary line
 */

import type { ExerciseRunResult, TestFailure } from "../types";

export function parseRSpec(stdout: string): ExerciseRunResult {
  const raw = stdout ?? "";

  // ── Compile / syntax error ────────────────────────────────────────────────
  // Present when there is no summary line at all
  const hasSummary = /\d+\s+(?:examples?|runs?)/.test(raw);
  if (!hasSummary && /SyntaxError|LoadError|NameError/i.test(raw)) {
    const errorLine =
      raw.match(/(SyntaxError|LoadError|NameError)[^\n]*/)?.[0] ??
      "Syntax or load error";
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

  // ── Detect format ─────────────────────────────────────────────────────────
  const isMintest = /\d+\s+runs?,/.test(raw);

  let totalTests = 0;
  let failedTests = 0;
  let passedTests = 0;

  if (isMintest) {
    // Minitest summary: "4 runs, 4 assertions, 1 failures, 0 errors, 0 skips"
    const summaryMatch = raw.match(
      /(\d+)\s+runs?,\s*\d+\s+assertions?,\s*(\d+)\s+failures?,\s*(\d+)\s+errors?/,
    );
    if (summaryMatch) {
      totalTests = parseInt(summaryMatch[1], 10);
      const failures = parseInt(summaryMatch[2], 10);
      const errors = parseInt(summaryMatch[3], 10);
      failedTests = failures + errors;
      passedTests = totalTests - failedTests;
    }
  } else {
    // RSpec summary: "3 examples, 1 failure"
    const summaryMatch = raw.match(/(\d+)\s+examples?,\s*(\d+)\s+failures?/);
    if (summaryMatch) {
      totalTests = parseInt(summaryMatch[1], 10);
      failedTests = parseInt(summaryMatch[2], 10);
      passedTests = totalTests - failedTests;
    }
  }

  // ── Individual failures ───────────────────────────────────────────────────
  const failures: TestFailure[] = [];

  if (isMintest) {
    // Minitest failure block:
    //   N) Failure:
    //   ClassName#method_name [file:line]:
    //   Expected: "..."
    //     Actual: "..."
    //
    // Or error block:
    //   N) Error:
    //   ClassName#method_name:
    //   ExceptionClass: message
    const minitestPattern =
      /^\s*\d+\)\s+(?:Failure|Error):\s*\n([^\[:\n]+(?:#[^\[:\n]+)?)\s*(?:\[[^\]]*\])?:\s*\n([\s\S]*?)(?=^\s*\d+\)\s+(?:Failure|Error):|$)/gm;
    let match: RegExpExecArray | null;

    while ((match = minitestPattern.exec(raw)) !== null) {
      const testName = match[1].trim();
      const messageBlock = match[2]
        .split("\n")
        .filter((l) => l.trim())
        .slice(0, 5)
        .join("\n")
        .trim();
      failures.push({ testName, message: messageBlock || "Test failed" });
    }

    // Simpler fallback if the above didn't match
    if (failures.length === 0 && failedTests > 0) {
      const simplePattern = /^\s*\d+\)\s+(?:Failure|Error):\s*\n(.+)/gm;
      let sm: RegExpExecArray | null;
      while ((sm = simplePattern.exec(raw)) !== null) {
        failures.push({ testName: sm[1].trim(), message: "Test failed" });
      }
    }
  } else {
    // RSpec failure blocks: "  1) TestSuite#method description"
    const failureHeaderPattern = /^\s+\d+\)\s+(.+)$/gm;
    let match: RegExpExecArray | null;

    while ((match = failureHeaderPattern.exec(raw)) !== null) {
      const testName = match[1].trim();
      const afterHeader = raw.slice(match.index + match[0].length);
      const messageLines = afterHeader
        .split("\n")
        .slice(1, 6)
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
