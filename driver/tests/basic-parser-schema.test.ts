import { parseDriverResult, type RawJudge0Result } from "../core/result-parser";
import { logger } from "../../api/src/libs/utils/logger";

/**
 * Basic schema test:
 * - feeds mocked Judge0 output
 * - parses with parseDriverResult
 * - validates essential schema fields
 *
 * Run:
 *   bun driver/tests/basic-parser-schema.test.ts
 */

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

const mockJudge0Output: RawJudge0Result = {
  stdout: null,
  time: null,
  memory: null,
  stderr: null,
  compile_output:
    "Main.java:44: error: unclosed string literal\n                        int arg_value = sc.nextInted\";\n                                                    ^\nMain.java:61: error: 'catch' without 'try'\n            } catch (Exception e) {\n              ^\nMain.java:28: error: 'try' without 'catch', 'finally' or resource declarations\n            try {\n            ^\nMain.java:67: error: illegal start of expression\n    private static String decodeString(String s) {\n    ^\n4 errors\n",
  status: {
    id: 6,
    description: "Compilation Error",
  },
};

const parsed = parseDriverResult(mockJudge0Output, 1);

// Basic top-level schema checks
assert(typeof parsed.verdict === "string", "verdict should be a string");
assert(Array.isArray(parsed.tests), "tests should be an array");
assert(typeof parsed.passedCount === "number", "passedCount should be a number");
assert(typeof parsed.totalCount === "number", "totalCount should be a number");
assert(typeof parsed.totalTimeMs === "number", "totalTimeMs should be a number");

// Per-test schema checks
for (const t of parsed.tests) {
  assert(typeof t.index === "number", "test.index should be number");
  assert(typeof t.passed === "boolean", "test.passed should be boolean");
  assert(typeof t.status === "string", "test.status should be string");
  assert(
    t.actual === null || typeof t.actual === "string",
    "test.actual should be string|null",
  );
  assert(
    t.expected === null || typeof t.expected === "string",
    "test.expected should be string|null",
  );
  assert(
    typeof t.executionTimeMs === "number",
    "test.executionTimeMs should be number",
  );
}

logger.info({ parsed }, "Parsed schema output");
logger.info("basic-parser-schema.test.ts passed");

