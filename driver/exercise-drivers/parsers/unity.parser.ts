/**
 * parsers/unity.parser.ts
 *
 * Parses the custom Unity-compatible shim output injected by the C combiner.
 *
 * Shim output format:
 *
 *   FAIL (testFunctionName line N): message    ← per-failure line
 *   OK (N tests)                               ← all-pass summary
 *   FAIL (N of M failed)                       ← partial-fail summary
 *
 * Compile error (no summary line present):
 *   hello_world.c:5:3: error: 'x' undeclared
 */

import type { ExerciseRunResult, TestFailure } from "../types";

export function parseUnity(stdout: string): ExerciseRunResult {
  const raw = stdout ?? "";

  // ── Compile error ─────────────────────────────────────────────────────────
  // Compile errors contain "file.c:line:col: error:" but no summary line.
  const hasSummary = /\bOK\s*\(\d+\s+tests?\)|\bFAIL\s*\(\d+\s+of\s+\d+\s+failed\)/.test(raw);
  if (/\.c:\d+:\d+:\s+error:/.test(raw) && !hasSummary) {
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

  // ── Summary line ──────────────────────────────────────────────────────────
  // "OK (N tests)"  → all passed
  // "FAIL (N of M failed)" → N failed out of M total
  let totalTests = 0;
  let failedTests = 0;
  let passedTests = 0;

  const okMatch = raw.match(/\bOK\s*\((\d+)\s+tests?\)/);
  const failMatch = raw.match(/\bFAIL\s*\((\d+)\s+of\s+(\d+)\s+failed\)/);

  if (okMatch) {
    totalTests = parseInt(okMatch[1], 10);
    passedTests = totalTests;
    failedTests = 0;
  } else if (failMatch) {
    failedTests = parseInt(failMatch[1], 10);
    totalTests = parseInt(failMatch[2], 10);
    passedTests = totalTests - failedTests;
  }

  // ── Individual failures ───────────────────────────────────────────────────
  // Shim format: "FAIL (testFunctionName line N): message"
  const failures: TestFailure[] = [];
  const failPattern = /^FAIL\s*\((\w+)\s+line\s+\d+\):\s*(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = failPattern.exec(raw)) !== null) {
    failures.push({
      testName: match[1].trim(),
      message: match[2].trim(),
    });
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
