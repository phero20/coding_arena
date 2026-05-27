/**
 * Languages fully supported by the exercise-drivers (injects test shims + parses stdout).
 * For these languages, we call driver.combine() and driver.parse().
 * For other languages, we just run raw code and trust the exit code.
 */
export const TEST_SUPPORTED_LANGUAGES = new Set([
  "python",
  "javascript",
  "typescript",
  "c",
  "cpp",
  "rust",
  "bash",
  "go",
  "java",
  "ruby",
  "csharp",
]);
