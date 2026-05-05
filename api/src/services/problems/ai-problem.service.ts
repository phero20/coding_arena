import { GeminiLlmService, type GeminiJsonResponse } from "../ai/gemini-llm.service";
import type {
  AiProblemOutput,
  ImportedProblemPayload,
} from "../../types/problems/problem-import.types";
import {
  sanitizeDescriptionForAi,
  SANITIZE_PROFILES,
} from "../../libs/security/prompt-sanitizer";
import {
  enrichSignatureForDriver,
  normalizeTestSuite,
} from "./testcase-canonical";
import type {
  DriverReadyFunctionSignature,
  FunctionSignature,
} from "../../types/problems/problem.types";

export interface AiRewriteResult {
  problem: AiProblemOutput["problem"];
  publicTests: AiProblemOutput["tests"]["public"];
  hiddenTests: AiProblemOutput["tests"]["hidden"];
  rawLlmResponse: GeminiJsonResponse<AiProblemOutput>["raw"];
}

import { type ICradle } from "../../libs/awilix-container";

function mergeFunctionSignature(
  input: ImportedProblemPayload,
  aiProblem: AiProblemOutput["problem"],
): FunctionSignature {
  const fromAi = aiProblem.function_signature;
  const fromInput = input.function_signature;

  const aiOk = (fromAi?.params?.length ?? 0) > 0 && fromAi?.name && fromAi?.return_type;
  const inputOk =
    (fromInput?.params?.length ?? 0) > 0 && fromInput?.name && fromInput?.return_type;

  if (aiOk) return fromAi as FunctionSignature;
  if (inputOk) return fromInput as FunctionSignature;
  if (fromAi) return fromAi as FunctionSignature;
  if (fromInput) return fromInput as FunctionSignature;

  throw new Error(
    "AI response missing function_signature with params; cannot validate test cases.",
  );
}

/**
 * Orchestrates the AI-based augmentation of imported problems.
 * Test cases are validated against a canonical type engine; on failure, one retry is attempted.
 */
export class AiProblemService {
  private readonly llm: GeminiLlmService;

  constructor({ llm }: ICradle) {
    this.llm = llm;
  }

  async rewriteAndGenerate(
    input: ImportedProblemPayload,
  ): Promise<AiRewriteResult> {
    const existingSolution = input.solutions || input.solution;
    const shouldGenerateSolution =
      !existingSolution || existingSolution.trim() === "";

    const systemPrompt = [
      "You are a Senior Technical Content Engineer specializing in Competitive Programming.",
      "Your goal: Augment the provided problem data with hints, test cases, and solutions while PRESERVING the original narrative content.",
      "",
      "=== MASTER PROTOCOL ===",
      "1. PRESERVE ORIGINAL FIELDS (CRITICAL):",
      "   - Return these exactly as they appear in input: 'title', 'difficulty', 'problem_slug', 'topics', 'description', 'examples', 'constraints', 'follow_ups', 'code_snippets'.",
      "",
      "2. FUNCTION SIGNATURE (must be executable / driver-ready):",
      "   - function_signature.name: method name users implement.",
      "   - return_type: use LeetCode-style strings: int, long, double, boolean, string, char, int[], int[][], string[], ListNode, TreeNode, or List<Integer> / vector<int> style wrappers.",
      "   - params: { name, type } for every argument; names must match testcase input keys exactly.",
      "",
      "3. TEST CASES — STRICT JSON (preferred):",
      "   - Each testcase has 'input' as a JSON OBJECT whose keys are EXACTLY the param names, in any order.",
      "   - Use NATIVE JSON types:",
      "     * int / long / double: JSON number",
      "     * boolean: JSON true/false",
      "     * string / char: JSON string",
      "     * int[] / string[]: JSON array, e.g. [2,7,11,15]",
      "     * int[][] / matrix: JSON array of arrays, e.g. [[1,2,3],[4,5,6]]",
      "     * ListNode: JSON array of integers, e.g. [1,2,3]",
      "     * TreeNode: level-order JSON array with nulls, e.g. [1,null,2,3] (use JSON null, not the string \"null\", inside arrays)",
      "   - expected_output: SAME typing rules as return_type (e.g. int[] => JSON array; int => number; boolean => true/false).",
      "   - LEGACY (only if JSON arrays are impossible in your output): 1D int[] may be a comma-separated string \"2, 7, 11\"; 2D int[][] may use semicolon rows: \"1,2;3,4\". Prefer JSON arrays whenever possible.",
      "",
      "4. EXAMPLE (Two Sum):",
      '   signature: { "name": "twoSum", "return_type": "int[]", "params": [{ "name": "nums", "type": "int[]" }, { "name": "target", "type": "int" }] }',
      '   testcase: { "input": { "nums": [2,7,11,15], "target": 9 }, "expected_output": [0,1] }',
      "",
      "5. Generate 3 public (is_sample true) and 10 hidden (is_sample false) tests.",
      "",
      "6. SOLUTION HANDLING:",
      `   - STATUS: ${shouldGenerateSolution ? "MISSING (Generate now)" : "PRESENT (Skip generation)"}`,
      "   - If MISSING, generate a solution in this EXACT Markdown format:",
      "     [TOC]",
      "     ## Video Solution",
      "     ---## Solution",
      "     ---",
      "     ### Overview",
      "     ### Approach 1: (Name)",
      "     #### Intuition",
      "     #### Algorithm",
      "     #### Implementation (Java Fenced Code)",
      "     #### Complexity Analysis",
      "",
      "7. HINTS: at least 5 hints total.",
      "",
      "=== OUTPUT SCHEMA (JSON) ===",
      "{",
      '  "problem": {',
      '    "title": "string",',
      '    "problem_id": "string",',
      '    "difficulty": "Easy" | "Medium" | "Hard",',
      '    "problem_slug": "string",',
      '    "topics": ["string"],',
      '    "description": "string",',
      '    "examples": [{ "example_num": number, "example_text": "string" }],',
      '    "constraints": ["string"],',
      '    "hints": ["string"],',
      '    "code_snippets": { "lang_id": "string" },',
      '    "function_signature": { "name": "string", "return_type": "string", "params": [{ "name": "string", "type": "string" }] },',
      '    "solutions": "string (ONLY if generated)"',
      "  },",
      '  "tests": {',
      '    "public": [{ "input": {}, "expected_output": null, "timeout_ms": 2000, "memory_limit_mb": 128, "is_sample": true }],',
      '    "hidden": [{ "input": {}, "expected_output": null, "timeout_ms": 2000, "memory_limit_mb": 128, "is_sample": false }]',
      "  }",
      "}",
    ].join("\n");

    const originalData = JSON.stringify({
      ...input,
      solution: undefined,
      solutions: undefined,
      description: sanitizeDescriptionForAi(
        input.description,
        SANITIZE_PROFILES.LOOSE,
      ),
    });

    let lastValidationError: string | null = null;
    let rawAggregate: GeminiJsonResponse<AiProblemOutput>["raw"] | undefined;

    for (let attempt = 0; attempt < 2; attempt++) {
      const userPromptParts = [
        "Process this problem JSON and return the augmented version in JSON mode.",
        "1. Preserve original narrative fields.",
        "2. GENERATE accurate function_signature matching the problem.",
        shouldGenerateSolution
          ? "3. GENERATE solution in [TOC] format."
          : "3. Solution exists. Omit or null 'solutions' in output.",
        "4. At least 5 hints.",
        "5. Exactly 3 public + 10 hidden tests; inputs must match signature param names and types.",
        "6. Prefer NATIVE JSON arrays/matrices for all array-typed params and for expected_output.",
        "",
        lastValidationError
          ? [
              "=== PREVIOUS ATTEMPT FAILED VALIDATION ===",
              "Fix ONLY testcases and/or function_signature/return_type so every testcase passes structural typing.",
              "Errors:",
              lastValidationError,
              "",
            ].join("\n")
          : "",
        "Original Data:",
        originalData,
      ];

      const userPrompt = userPromptParts.filter(Boolean).join("\n");

      const { data, raw } =
        await this.llm.generateJson<AiProblemOutput>({
          systemPrompt,
          userPrompt,
          temperature: 0,
          maxTokens: 16384,
        });

      rawAggregate = raw;

      if (!data.problem) {
        throw new Error("AI response did not include a problem object");
      }

      if (!data.tests?.public?.length || !data.tests?.hidden?.length) {
        lastValidationError =
          "AI failed to return both public and hidden test arrays with at least one case each.";
        continue;
      }

      const finalProblemBase = {
        ...data.problem,
        solutions: existingSolution || data.problem.solutions || "",
        title: input.title || data.problem.title,
        description: input.description || data.problem.description,
        problem_slug: input.problem_slug || data.problem.problem_slug,
        difficulty: input.difficulty || data.problem.difficulty,
        problem_id: input.problem_id || data.problem.problem_id,
        topics: input.topics || data.problem.topics || [],
        examples: input.examples || data.problem.examples || [],
        constraints: input.constraints || data.problem.constraints || [],
        follow_ups: input.follow_ups || data.problem.follow_ups || [],
        code_snippets: input.code_snippets || data.problem.code_snippets || {},
      };

      let signature: DriverReadyFunctionSignature;
      try {
        signature = enrichSignatureForDriver(
          mergeFunctionSignature(input, data.problem),
        );
      } catch (e: any) {
        lastValidationError = e?.message ?? String(e);
        continue;
      }

      const mergedProblem = {
        ...finalProblemBase,
        function_signature: signature,
      };

      try {
        const { publicTests, hiddenTests } = normalizeTestSuite(
          data.tests.public as any[],
          data.tests.hidden as any[],
          signature,
        );

        return {
          problem: mergedProblem,
          publicTests,
          hiddenTests,
          rawLlmResponse: rawAggregate ?? raw,
        };
      } catch (e: any) {
        lastValidationError = e?.message ?? String(e);
      }
    }

    throw new Error(
      lastValidationError ??
        "AI import failed after retries: testcase validation did not pass.",
    );
  }
}
