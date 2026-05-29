import { CombineOptions } from "../types";
import { stripLines, ensureNewline } from "./helpers";

/**
 * Ruby (RSpec / Minitest)
 *
 * Test files require the solution file in various ways. We strip those
 * require lines and prepend the solution directly.
 *
 * Patterns stripped (solution require only — minitest/autorun is kept):
 *   require_relative 'hello_world'
 *   require_relative "hello_world"
 *   require_relative './hello_world'
 *   require_relative "../hello_world"
 *   require_relative 'hello-world'   (kebab-case)
 *   require 'hello_world'            (without relative)
 *
 * Minitest is available on Judge0's Ruby environment, so:
 *   require 'minitest/autorun'       ← kept as-is
 */
export function combineRuby(opts: CombineOptions): string {
  const { exerciseSlug, userCode, testCode } = opts;

  const snakeSlug = exerciseSlug.replace(/-/g, "_");
  const kebabSlug = exerciseSlug; // already kebab

  // Build a pattern that matches any require/require_relative of the solution file.
  // Handles: snake_case, kebab-case, with or without ./, ../, quotes style.
  const requirePattern = new RegExp(
    `^\\s*require(?:_relative)?\\s+` +
    `['"]` +
    `(?:\\.{1,2}/)?` +                          // optional ./ or ../
    `(?:${escapeRegExp(snakeSlug)}|${escapeRegExp(kebabSlug)})` +
    `['"]`,
  );

  const cleanedTest = stripLines(testCode, requirePattern);

  return [
    "# === Solution ===",
    ensureNewline(userCode),
    "# === Tests ===",
    ensureNewline(cleanedTest),
  ].join("\n");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
