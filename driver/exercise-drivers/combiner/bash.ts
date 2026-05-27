import { CombineOptions } from "../types";
import { stripLines, ensureNewline } from "./helpers";

/**
 * Bash (bats-compatible runner)
 *
 * Bats test files source the solution script:
 *   source ./hello_world.sh
 *
 * We strip that source line and prepend the solution directly.
 * The outer script must NOT use `set -e` — test failures are isolated
 * inside per-test subshells so the runner can continue after a failure.
 */
export function combineBash(opts: CombineOptions): string {
  const { exerciseSlug, userCode, testCode } = opts;

  const snakeSlug = exerciseSlug.replace(/-/g, "_");

  // Strip shebang, source/. lines for the solution file, and bats load lines
  const sourcePattern = new RegExp(
    `^\\s*(source|\\.)\\s+(\\.{1,2}/)?${snakeSlug}\\.sh`,
  );
  let cleanedTest = stripLines(testCode, /^#!.*bats/);
  cleanedTest = stripLines(cleanedTest, sourcePattern);
  cleanedTest = stripLines(cleanedTest, /^\s*load\s+/);

  // Transform @test "description" { → _bats_test_N() {
  const testNames: string[] = [];
  let idx = 0;
  cleanedTest = cleanedTest.replace(
    /@test\s+"([^"]+)"\s*\{/g,
    (_, name: string) => {
      testNames.push(name);
      return `_bats_test_${idx++}() {`;
    },
  );

  // Minimal bats-compatible shim
  // - run() captures both stdout+stderr into _BATS_OUTPUT and exit status into _BATS_STATUS
  // - assert_output supports --partial flag
  // - assert_equal is provided (exercism tests use it)
  const batsShim = `\
# ─── Minimal bats-compatible runner (injected by exercise driver) ───────────
_BATS_OUTPUT=''
_BATS_STATUS=0

run() {
  _BATS_OUTPUT=$( "$@" 2>&1 )
  _BATS_STATUS=$?
}

assert_success() {
  [ "$_BATS_STATUS" -eq 0 ] || { echo "Expected exit 0, got $_BATS_STATUS"; return 1; }
}

assert_failure() {
  [ "$_BATS_STATUS" -ne 0 ] || { echo "Expected non-zero exit, got 0"; return 1; }
}

assert_output() {
  if [ "$1" = "--partial" ]; then
    shift
    echo "$_BATS_OUTPUT" | grep -qF "$1" || {
      echo "Expected output to contain '$1', got '$_BATS_OUTPUT'"
      return 1
    }
  else
    [ "$_BATS_OUTPUT" = "$1" ] || {
      echo "Expected output '$1', got '$_BATS_OUTPUT'"
      return 1
    }
  fi
}

assert_line() {
  echo "$_BATS_OUTPUT" | grep -qF "$1" || { echo "Line not found: $1"; return 1; }
}

refute_output() {
  [ "$_BATS_OUTPUT" != "$1" ] || { echo "Expected output NOT '$1'"; return 1; }
}

assert_equal() {
  [ "$1" = "$2" ] || { echo "Expected '$2' got '$1'"; return 1; }
}
# ─────────────────────────────────────────────────────────────────────────────`;

  // Runner: each test runs in a subshell so failures are isolated.
  // The outer script has no set -e, so it continues after a failed test.
  const runnerLines: string[] = [
    "_BATS_PASSED=0",
    "_BATS_FAILED=0",
  ];

  for (let i = 0; i < testNames.length; i++) {
    // Escape single quotes in the test name for safe shell embedding
    const safe = testNames[i].replace(/'/g, "'\\''");
    runnerLines.push(
      `if ( set -e; _bats_test_${i} ) >/tmp/_bats_out_${i} 2>&1; then`,
      `  echo "✓ ${safe}"`,
      `  _BATS_PASSED=$((_BATS_PASSED + 1))`,
      `else`,
      `  _msg=$(cat /tmp/_bats_out_${i} 2>/dev/null | head -1)`,
      `  echo "✗ ${safe}: $_msg"`,
      `  _BATS_FAILED=$((_BATS_FAILED + 1))`,
      `fi`,
    );
  }

  runnerLines.push(
    `echo ""`,
    `echo "Tests: $_BATS_PASSED passed, $_BATS_FAILED failed, $((_BATS_PASSED + _BATS_FAILED)) total"`,
    `[ "$_BATS_FAILED" -eq 0 ]`,
  );

  return [
    "#!/usr/bin/env bash",
    "# outer script intentionally has no set -e so the runner survives test failures",
    batsShim,
    "# === Solution ===",
    ensureNewline(userCode),
    "# === Tests ===",
    ensureNewline(cleanedTest),
    runnerLines.join("\n"),
  ].join("\n");
}
