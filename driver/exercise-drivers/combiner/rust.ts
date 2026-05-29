import { CombineOptions } from "../types";
import { ensureNewline } from "./helpers";

/**
 * Rust (cargo test)
 *
 * Exercism Rust exercises have the solution in lib.rs and tests in
 * a separate file or inline. We append the test code after the solution,
 * wrapping it in a #[cfg(test)] module if it isn't already.
 *
 * Edge cases handled:
 *   - Test code already wrapped in #[cfg(test)] → used as-is
 *   - Test code has `mod tests {` without #[cfg(test)] → wrapped correctly
 *   - `extern crate` declarations in test code → preserved (valid in older editions)
 *   - Suppress common warnings that would clutter output
 */
export function combineRust(opts: CombineOptions): string {
  const { userCode, testCode } = opts;

  const trimmedTest = testCode.trim();

  // Already has #[cfg(test)] — use as-is
  const alreadyWrapped = /^\s*#\[cfg\(test\)\]/m.test(trimmedTest);

  let testSection: string;

  if (alreadyWrapped) {
    testSection = trimmedTest;
  } else {
    // Check if the test code has a bare `mod tests {` without #[cfg(test)]
    // In that case we just prepend the attribute
    const hasBareModTests = /^\s*mod\s+\w+\s*\{/m.test(trimmedTest);

    if (hasBareModTests) {
      // Prepend #[cfg(test)] before the mod declaration
      testSection = trimmedTest.replace(
        /^(\s*mod\s+\w+\s*\{)/m,
        "#[cfg(test)]\n$1",
      );
    } else {
      // Wrap the entire test body in a cfg(test) module
      const indented = trimmedTest
        .split("\n")
        .map((l) => `    ${l}`)
        .join("\n");
      testSection = `#[cfg(test)]\nmod tests {\n    use super::*;\n\n${indented}\n}`;
    }
  }

  return [
    // Suppress common warnings that clutter test output
    "#![allow(unused_imports, dead_code, unused_variables)]",
    "",
    "// === Solution ===",
    ensureNewline(userCode),
    "// === Tests ===",
    ensureNewline(testSection),
  ].join("\n");
}
