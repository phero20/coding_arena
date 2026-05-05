/**
 * Shared constants for the Driver system.
 * Use these markers in templates for reliable string replacement.
 */

export const MARKERS = {
  USER_CODE: "{{USER_CODE}}",
  MAIN_LOOP: "{{MAIN_LOOP}}",
  BOILERPLATE: "{{BOILERPLATE}}",
  IMPORTS: "{{IMPORTS}}",
};

export const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  java: 62,      // OpenJDK 13
  python: 71,    // Python 3.8.1
  cpp: 54,       // C++ (GCC 9.2.0)
  javascript: 63 // Node.js 12.14.0
};

export const RESULT_DELIMITER = "@@RESULT@@";
export const TIME_DELIMITER = "@@TIME@@";
export const ERROR_DELIMITER = "@@RUNTIME_ERROR@@";
