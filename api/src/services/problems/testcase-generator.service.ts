import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { type ICradle } from "../../libs/awilix-container";
import { ProblemModel } from "../../mongo/models/problem.model";
import { ProblemTestModel } from "../../mongo/models/problem-test.model";
import { normalizeTestSuite } from "./testcase-canonical";
import { createLogger } from "../../libs/utils/logger";
import { type FunctionSignature } from "../../types/problems/problem.types";

const logger = createLogger("testcase-generator.service");

const PRIMARY_MODEL_ID = "deepseek.v3.2";
const FALLBACK_MODEL_ID = "openai.gpt-oss-120b-1:0";

export interface TestCaseGeneratorResult {
  problemId: string;
  publicCount: number;
  hiddenCount: number;
  rawLlmResponse: any;
}

export class TestcaseGeneratorService {
  private readonly bedrockClient: BedrockRuntimeClient;

  constructor(_cradle: ICradle) {
    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "us-east-1",
    });
  }

  async generateTestcases(problemId: string): Promise<TestCaseGeneratorResult> {
    logger.info({ problemId }, "Initiating AI test case generation via Amazon Bedrock");

    // 1. Fetch lightweight problem data
    const problem = await ProblemModel.findOne({ problem_id: problemId })
      .select("title description constraints examples function_signature class_signature is_premium topics")
      .lean();

    if (!problem) {
      throw new Error(`Problem not found with ID: ${problemId}`);
    }

    if (problem.is_premium) {
      logger.warn({ problemId }, "Problem is premium — skipping test case generation");
      throw new Error(`Problem ${problemId} is premium and cannot be auto-generated.`);
    }

    if (!problem.function_signature && !problem.class_signature) {
      throw new Error(`Problem ${problemId} is missing a valid function_signature or class_signature.`);
    }

    const isClass = !!problem.class_signature;
    const isDatabase = problem.topics?.includes("Database") || problem.topics?.includes("Pandas");
    const signature = problem.function_signature as FunctionSignature | undefined;
    const classSignature = problem.class_signature as any | undefined;

    // 2. Prepare the prompt protocol
    const systemPrompt = [
      "You are the Official LeetCode Testcase Generation Engine.",
      "The provided problem is directly from the LeetCode dataset. Your goal is to generate testcases EXACTLY like LeetCode does for this specific problem.",
      "Generate exactly 10 test cases (3 public, 7 hidden).",
      "",
      "=== MASTER PROTOCOL ===",
      ...(isDatabase ? [
        "CRITICAL WARNING FOR DATABASE/PANDAS PROBLEMS:",
        "   - You MUST read the problem description to find the required SQL/Pandas tables.",
        "   - The 'input' JSON object MUST contain the full table data (keys=table names, values={\"headers\": [...], \"values\": [...]}).",
        "   - Do NOT just generate function parameters (like 'N'). The parameters are useless without the tables!",
        "   - If the function signature has parameters, include them alongside the tables in the 'input' object.",
        "",
      ] : []),
      "1. TEST CASES — STRICT JSON:",
      "   - If it is a Standard Problem, each testcase must have an 'input' object whose keys match the param names in the function signature.",
      "   - If it is a Class Design Problem (e.g. LRU Cache), 'input' MUST have exactly two keys: 'methods' (array of strings, first being the class name) and 'args' (array of arrays containing the arguments for each method).",
      "   - Use NATIVE JSON types for basic types (int: number, boolean: true/false, string: string).",
      "   - For arrays (int[], string[]), return a standard JSON array: [1, 2, 3].",
      "   - For matrices (int[][]), return an array of arrays: [[1, 2], [3, 4]].",
      "   - For ListNode or TreeNode, return the exact JSON format that LeetCode expects in its testcases (usually a flat array, but follow LeetCode's standard for this specific problem).",
      "   - 'expected_output' must match the exact LeetCode output format for this problem. IMPORTANT: If the problem is an in-place modification (return type is 'void'), 'expected_output' MUST contain the final modified state of the array/matrix, NOT null. For Class Problems, expected_output MUST be an array of return values (null for void methods).",
      "   - CRITICAL WARNING FOR CLASS PROBLEMS: You must strictly align `expected_output` with the `methods` array. If a method returns an `int`, you MUST return an integer. If it returns a `boolean`, you MUST return a boolean. NEVER return `null` unless the method specifically has a `void` return type (like the constructor). Do not generate invalid out-of-bounds method calls that would result in null.",
      "   - WARNING FOR TREE/GRAPH INPUTS IN CLASSES: If a class method (like the constructor) takes a TreeNode or ListNode as an argument (which is formatted as an array), you MUST wrap that array inside the `args` array! (e.g., if the tree is [1, 2, 3], the args array for that method must be `[[1, 2, 3]]`, NOT `[1, 2, 3]`).",
      "",
      "2. CONSTRAINTS & TOKEN LIMITS (CRITICAL):",
      "   - ALL testcases must strictly adhere to the problem constraints.",
      "   - WARNING: To prevent token limits, NEVER generate an array or string longer than 40 elements, even if the constraints allow up to 10^4. Keep them reasonably sized.",
      "",
      "=== OUTPUT SCHEMA (JSON) ===",
      "{",
      '  "tests": {',
      '    "public": [{ "input": {}, "expected_output": "ANY_VALID_JSON", "timeout_ms": 2000, "memory_limit_mb": 128, "is_sample": true }],',
      '    "hidden": [{ "input": {}, "expected_output": "ANY_VALID_JSON", "timeout_ms": 2000, "memory_limit_mb": 128, "is_sample": false }]',
      "  }",
      "}"
    ].join("\n");

    const originalData = JSON.stringify({
      title: problem.title,
      description: problem.description,
      constraints: problem.constraints,
      examples: problem.examples,
      function_signature: problem.function_signature,
      class_signature: problem.class_signature,
    });

    let lastValidationError: string | null = null;
    let rawAggregate: any;

    // 3. Retry Loop (2 attempts for structural validation)
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
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

      let data: any = null;
      let rawResponse = "";

      try {
        logger.info({ problemId, attempt }, "Invoking PRIMARY model (DeepSeek) for testcase generation");
        rawResponse = await this.invokeModelOnBedrock(problemId, fullPrompt, PRIMARY_MODEL_ID);
        data = this.extractAndParseJSON(rawResponse);
      } catch (err: any) {
        logger.warn({ problemId, attempt, error: err.message }, "Primary model failed. Falling back to FALLBACK model (GPT)");
        try {
          rawResponse = await this.invokeModelOnBedrock(problemId, fullPrompt, FALLBACK_MODEL_ID);
          data = this.extractAndParseJSON(rawResponse);
        } catch (fallbackErr: any) {
          logger.error({ problemId, error: fallbackErr.message }, "Fallback model also failed");
          lastValidationError = fallbackErr.message;
          continue;
        }
      }

      rawAggregate = rawResponse;

      if (!data.tests?.public?.length || !data.tests?.hidden?.length) {
        lastValidationError = "AI failed to return both public and hidden test arrays.";
        continue;
      }

      try {
        // 4. Validate through the canonical parser
        const { publicTests, hiddenTests } = normalizeTestSuite(
          data.tests.public,
          data.tests.hidden,
          {
            functionSignature: signature,
            classSignature: classSignature
          }
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

  private extractAndParseJSON(raw: string): any {
    const stripped = raw.replace(/```json/g, "").replace(/```/g, "");
    const firstBrace = stripped.indexOf("{");
    const lastBrace = stripped.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found in response");
    }

    const jsonOnly = stripped.slice(firstBrace, lastBrace + 1);
    return JSON.parse(jsonOnly);
  }

  private async invokeModelOnBedrock(
    problemId: string,
    prompt: string,
    modelId: string,
  ): Promise<string> {
    const payload = {
      max_completion_tokens: 8000,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    try {
      const response = await this.bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return responseBody.choices?.[0]?.message?.content ?? "";
    } catch (error: any) {
      logger.error(
        { problemId, errorName: error.name, errorMessage: error.message },
        "Amazon Bedrock invocation failed",
      );

      throw new Error(`Bedrock request failed [${error.name ?? "UnknownError"}]: ${error.message}`);
    }
  }
}
