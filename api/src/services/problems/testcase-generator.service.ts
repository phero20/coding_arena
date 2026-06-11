import { type ICradle } from "../../libs/awilix-container";
import { ProblemModel } from "../../mongo/models/problem.model";
import { ProblemTestModel } from "../../mongo/models/problem-test.model";
import { type GeminiLlmService } from "../ai/gemini-llm.service";
import { normalizeTestSuite } from "./testcase-canonical";
import { createLogger } from "../../libs/utils/logger";
import { type FunctionSignature } from "../../types/problems/problem.types";

const logger = createLogger("testcase-generator.service");

export interface TestCaseGeneratorResult {
  problemId: string;
  publicCount: number;
  hiddenCount: number;
  rawLlmResponse: any;
}

export class TestcaseGeneratorService {
  private readonly llm: GeminiLlmService;

  constructor({ geminiLlmService }: ICradle) {
    this.llm = geminiLlmService;
  }

  async generateTestcases(problemId: string): Promise<TestCaseGeneratorResult> {
    logger.info({ problemId }, "Initiating AI test case generation via Gemini 2.5 Flash");

    // 1. Fetch lightweight problem data
    const problem = await ProblemModel.findOne({ problem_id: problemId })
      .select("title description constraints examples function_signature")
      .lean();

    if (!problem) {
      throw new Error(`Problem not found with ID: ${problemId}`);
    }

    if (!problem.function_signature || !problem.function_signature.name) {
      throw new Error(`Problem ${problemId} is missing a valid function_signature.`);
    }

    const signature = problem.function_signature as FunctionSignature;

    // 2. Prepare the prompt protocol
    const systemPrompt = [
      "You are the Official LeetCode Testcase Generation Engine.",
      "The provided problem is directly from the LeetCode dataset. Your goal is to generate testcases EXACTLY like LeetCode does for this specific problem.",
      "Generate exactly 10 test cases (3 public, 7 hidden).",
      "",
      "=== MASTER PROTOCOL ===",
      "1. TEST CASES — STRICT JSON:",
      "   - Each testcase must have an 'input' object whose keys match the param names in the function signature.",
      "   - Use NATIVE JSON types for basic types (int: number, boolean: true/false, string: string).",
      "   - For arrays (int[], string[]), return a standard JSON array: [1, 2, 3].",
      "   - For matrices (int[][]), return an array of arrays: [[1, 2], [3, 4]].",
      "   - For ListNode or TreeNode, return the exact JSON format that LeetCode expects in its testcases (usually a flat array, but follow LeetCode's standard for this specific problem).",
      "   - 'expected_output' must match the exact LeetCode output format for this problem.",
      "",
      "2. CONSTRAINTS & TOKEN LIMITS (CRITICAL):",
      "   - ALL testcases must strictly adhere to the problem constraints.",
      "   - WARNING: To prevent token limits, NEVER generate an array or string longer than 40 elements, even if the constraints allow up to 10^4. Keep them reasonably sized.",
      "",
      "=== OUTPUT SCHEMA (JSON) ===",
      "{",
      '  "tests": {',
      '    "public": [{ "input": {}, "expected_output": null, "timeout_ms": 2000, "memory_limit_mb": 128, "is_sample": true }],',
      '    "hidden": [{ "input": {}, "expected_output": null, "timeout_ms": 2000, "memory_limit_mb": 128, "is_sample": false }]',
      "  }",
      "}"
    ].join("\n");

    const originalData = JSON.stringify({
      title: problem.title,
      description: problem.description,
      constraints: problem.constraints,
      examples: problem.examples,
      function_signature: problem.function_signature,
    });

    let lastValidationError: string | null = null;
    let rawAggregate: any;

    // 3. Retry Loop (2 attempts)
    for (let attempt = 0; attempt < 2; attempt++) {
      const userPromptParts = [
        "Process this problem JSON and return the generated testcases in JSON mode.",
        "Exactly 3 public + 7 hidden tests; inputs must match signature param names and types.",
        "",
        lastValidationError
          ? [
              "=== PREVIOUS ATTEMPT FAILED VALIDATION ===",
              "Fix the testcases so they pass structural typing based on the signature.",
              "Errors:",
              lastValidationError,
              "",
            ].join("\n")
          : "",
        "Original Data:",
        originalData,
      ];

      const userPrompt = userPromptParts.filter(Boolean).join("\n");

      // Strictly use Gemini 2.5 Flash
      const { data, raw } = await this.llm.generateJson<any>({
        model: "gemini-2.5-flash",
        systemPrompt,
        userPrompt,
        temperature: 0.1,
        maxTokens: 8000,
      });

      rawAggregate = raw;

      if (!data.tests?.public?.length || !data.tests?.hidden?.length) {
        lastValidationError = "AI failed to return both public and hidden test arrays.";
        continue;
      }

      try {
        // 4. Validate through the canonical parser
        const { publicTests, hiddenTests } = normalizeTestSuite(
          data.tests.public,
          data.tests.hidden,
          signature as any
        );

        // 5. Upsert to Database
        await ProblemTestModel.updateOne(
          { problem_id: problemId, type: "public" },
          { 
            $set: { 
              cases: publicTests.map(c => ({
                input: c.input,
                expected_output: c.expected_output,
                weight: 1,
                is_sample: true
              }))
            }
          },
          { upsert: true }
        );

        await ProblemTestModel.updateOne(
          { problem_id: problemId, type: "hidden" },
          { 
            $set: { 
              cases: hiddenTests.map(c => ({
                input: c.input,
                expected_output: c.expected_output,
                weight: 1,
                is_sample: false
              }))
            }
          },
          { upsert: true }
        );

        logger.info({ problemId }, "Successfully generated and saved 10 test cases.");

        return {
          problemId,
          publicCount: publicTests.length,
          hiddenCount: hiddenTests.length,
          rawLlmResponse: rawAggregate,
        };
      } catch (e: any) {
        lastValidationError = e?.message ?? String(e);
        logger.warn({ problemId, attempt, error: lastValidationError }, "Validation failed. Retrying...");
      }
    }

    throw new Error(
      lastValidationError ?? "Test case generation failed after retries: validation did not pass."
    );
  }
}
