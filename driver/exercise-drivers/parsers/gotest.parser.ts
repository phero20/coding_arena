/**
 * parsers/gotest.parser.ts
 *
 * Parses `go test` stdout output.
 *
 * Typical go test output:
 *
 *   --- FAIL: TestHelloWorld (0.00s)
 *       hello_world_test.go:10: got "Goodbye, Mars!", want "Hello, World!"
 *   --- PASS: TestLeap (0.00s)
 *   --- SKIP: TestOptional (0.00s)
 *   FAIL
 *   exit status 1
 *   FAIL    hello-world     0.002s
 *
 * Subtests:
 *   --- FAIL: TestHelloWorld/SubtestName (0.00s)
 *
 * All pass:
 *   --- PASS: TestHelloWorld (0.00s)
 *   ok      hello-world     0.001s
 *
 * Compile error:
 *   ./hello_world.go:5:2: undefined: fmt
 */

import type { ExerciseRunResult, TestFailure } from "../types";

export function parseGoTest(stdout: string): ExerciseRunResult {
  const raw = stdout ?? "";

  // ── Compile error ─────────────────────────────────────────────────────────
  // Go compile errors look like: "./file.go:line:col: message"
  // Only treat as compile error if there are no test result lines
  if (/\.go:\d+:\d+:/.test(raw) && !/--- (PASS|FAIL|SKIP):/.test(raw)) {
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

  // ── Count PASS / FAIL / SKIP lines ───────────────────────────────────────
  // Subtests (TestName/SubtestName) are included — the slash is preserved
  const passLines = (raw.match(/^--- PASS:/gm) ?? []).length;
  const failLines = (raw.match(/^--- FAIL:/gm) ?? []).length;
  // SKIP lines are not counted as failures
  const totalTests = passLines + failLines;

  // ── Individual failures ───────────────────────────────────────────────────
  const failures: TestFailure[] = [];

  // Match each FAIL block. The test name may contain "/" for subtests.
  // We use a two-pass approach: first collect all FAIL test names and positions,
  // then extract the message block between consecutive markers.
  const failHeaderPattern = /^--- FAIL:\s+(\S+)\s+\([\d.]+s\)/gm;
  // Collect all markers (PASS, FAIL, SKIP, ok, FAIL\s) for boundary detection
  const boundaryPattern = /^(?:--- (?:PASS|FAIL|SKIP):|(?:ok|FAIL)\s)/gm;

  // Build a list of boundary positions for slicing message blocks
  const boundaries: number[] = [];
  let bm: RegExpExecArray | null;
  while ((bm = boundaryPattern.exec(raw)) !== null) {
    boundaries.push(bm.index);
  }
  boundaries.push(raw.length); // sentinel

  let fm: RegExpExecArray | null;
  while ((fm = failHeaderPattern.exec(raw)) !== null) {
    const testName = fm[1]; // preserve subtest slashes as-is
    const headerEnd = fm.index + fm[0].length;

    // Find the next boundary after this header to delimit the message block
    const nextBoundary = boundaries.find((b) => b > headerEnd) ?? raw.length;
    const messageBlock = raw
      .slice(headerEnd, nextBoundary)
      .split("\n")
      .filter((l) => l.trim().length > 0)
      .slice(0, 5)
      .join("\n")
      .trim();

    failures.push({
      testName,
      message: messageBlock || "Test failed",
    });
  }

  // Fallback: if the regex above produced no failures but failLines > 0
  if (failures.length === 0 && failLines > 0) {
    const simplePattern = /^--- FAIL:\s+(\S+)/gm;
    let sm: RegExpExecArray | null;
    while ((sm = simplePattern.exec(raw)) !== null) {
      failures.push({ testName: sm[1], message: "Test failed" });
    }
  }

  // ── Overall result ────────────────────────────────────────────────────────
  // "ok" at the start of a line means all tests passed
  const overallPass = /^ok\s/m.test(raw) && failLines === 0;

  return {
    passed: overallPass,
    totalTests,
    passedTests: passLines,
    failedTests: failLines,
    compileError: null,
    failures,
    rawOutput: raw,
  };
}
