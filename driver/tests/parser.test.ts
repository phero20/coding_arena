import { parseDriverResult, RawJudge0Result } from "../core/result-parser";

/**
 * driver/tests/parser.test.ts
 * Run with: bun run driver/tests/parser.test.ts
 */

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

console.log("🧪 Testing Driver Result Parser...");

// ─────────────────────────────────────────────────────────────────────────────
// 1. Test Case: Perfect Success (3/3 Accepted)
// ─────────────────────────────────────────────────────────────────────────────
{
  const raw: RawJudge0Result = {
    status: { id: 3, description: "Accepted" },
    stdout: `
      @@RESULT@@:[0,1] @@EXPECTED@@:[0,1] @@PASS@@:true @@TIME@@:1.2
      @@RESULT@@:[1,2] @@EXPECTED@@:[1,2] @@PASS@@:true @@TIME@@:0.8
      @@RESULT@@:[2,3] @@EXPECTED@@:[2,3] @@PASS@@:true @@TIME@@:1.0
    `,
    time: "0.15",
    memory: 15000,
  };

  const res = parseDriverResult(raw, 3);
  assert(res.verdict === "ACCEPTED", "Should be overall ACCEPTED");
  assert(res.passedCount === 3, "Passed count should be 3");
  assert(res.tests[0].actual === "[0,1]", "Should parse actual value");
  assert(res.tests[0].executionTimeMs === 1.2, "Should parse time");
  console.log("✅ Case 1: All Accepted Passed");
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Test Case: One Wrong Answer
// ─────────────────────────────────────────────────────────────────────────────
{
  const raw: RawJudge0Result = {
    status: { id: 3, description: "Accepted" }, // Judge0 says process ran, but driver says WA
    stdout: `
      @@RESULT@@:[0,1] @@EXPECTED@@:[0,1] @@PASS@@:true @@TIME@@:1.2
      @@RESULT@@:[1,1] @@EXPECTED@@:[1,2] @@PASS@@:false @@TIME@@:0.8
    `,
  };

  const res = parseDriverResult(raw, 2);
  assert(res.verdict === "WRONG_ANSWER", "Should be overall WRONG_ANSWER");
  assert(res.passedCount === 1, "Passed count should be 1");
  assert(res.tests[1].passed === false, "Second test should be failed");
  console.log("✅ Case 2: Wrong Answer Passed");
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Test Case: Caught Runtime Error (Mid-Loop)
// ─────────────────────────────────────────────────────────────────────────────
{
  const raw: RawJudge0Result = {
    status: { id: 3, description: "Accepted" },
    stdout: `
      @@RESULT@@:10 @@EXPECTED@@:10 @@PASS@@:true @@TIME@@:5.0
      @@ERROR@@:case=1 phase=invoke msg=NullPointerException:something was null
      @@RESULT@@:20 @@EXPECTED@@:20 @@PASS@@:true @@TIME@@:2.0
    `,
  };

  const res = parseDriverResult(raw, 3);
  assert(res.verdict === "RUNTIME_ERROR", "First failure (RE) should define overall verdict");
  assert(res.tests[1].status === "RUNTIME_ERROR", "Test 1 should be RE");
  assert(res.tests[1].errorMessage === "NullPointerException:something was null", "Should capture error message");
  assert(res.tests[2].index === 2, "Should correctly resume parsing after error");
  assert(res.tests[2].passed === true, "Third test still passed");
  console.log("✅ Case 3: Caught Runtime Error Passed");
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Test Case: Process Crash (Silent Failure)
// ─────────────────────────────────────────────────────────────────────────────
{
  const raw: RawJudge0Result = {
    status: { id: 11, description: "Runtime Error (SIGSEGV)" },
    stdout: `@@RESULT@@:true @@EXPECTED@@:true @@PASS@@:true @@TIME@@:1.0`, // Crashed after 1st test
    stderr: "Segmentation fault (core dumped)",
  };

  const res = parseDriverResult(raw, 3);
  assert(res.verdict === "RUNTIME_ERROR", "Should map Judge0 signal to RE");
  assert(res.tests[0].passed === true, "First test was fine");
  assert(res.tests[1].status === "SYSTEM_ERROR", "Second test missing due to crash");
  assert(res.systemError?.includes("Segmentation fault"), "Should capture stderr");
  console.log("✅ Case 4: Process Crash Recovery Passed");
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Test Case: Compilation Error
// ─────────────────────────────────────────────────────────────────────────────
{
  const raw: RawJudge0Result = {
    status: { id: 6, description: "Compilation Error" },
    compile_output: "Main.java:5: error: ';' expected",
  };

  const res = parseDriverResult(raw, 1);
  assert(res.verdict === "COMPILE_ERROR", "Should be COMPILE_ERROR");
  assert(res.compilationError?.includes("';' expected"), "Should capture compiler output");
  console.log("✅ Case 5: Compilation Error Passed");
}

console.log("\n✨ ALL PARSER TESTS PASSED! ✨");

// ─────────────────────────────────────────────────────────────────────────────
// 6. Test Case: Unknown lines + duplicate indices => parsingWarnings
// ─────────────────────────────────────────────────────────────────────────────
{
  const raw: RawJudge0Result = {
    status: { id: 3, description: "Accepted" },
    stdout: `
      some debug print from user code
      @@RESULT@@:1 @@EXPECTED@@:1 @@PASS@@:true @@TIME@@:1.0
      @@RESULT@@:2 @@EXPECTED@@:2 @@PASS@@:true @@TIME@@:1.0
      @@ERROR@@:case=1 phase=invoke msg=Oops:duplicate-index
    `,
  };

  const res = parseDriverResult(raw, 2);
  assert(Array.isArray(res.parsingWarnings), "Should include parsingWarnings");
  assert((res.parsingWarnings?.length ?? 0) >= 1, "Should report at least one warning");
  assert(res.tests.length === 2, "Should dedupe to 2 tests");
  console.log("✅ Case 6: Parser warnings + dedupe Passed");
}
