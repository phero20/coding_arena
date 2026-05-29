<<<<<<< HEAD
import type { GroqJsonResponse } from "../ai/groq-llm.service";
import { GroqLlmService } from "../ai/groq-llm.service";
=======
import { GeminiLlmService, type GeminiJsonResponse } from "../ai/gemini-llm.service";
>>>>>>> prod-deploy
import type {
  AiProblemOutput,
  ImportedProblemPayload,
} from "../../types/problems/problem-import.types";
import {
  sanitizeDescriptionForAi,
  SANITIZE_PROFILES,
} from "../../libs/security/prompt-sanitizer";
<<<<<<< HEAD
=======
import {
  enrichSignatureForDriver,
  normalizeTestSuite,
} from "./testcase-canonical";
import type {
  ClassSignature,
  DriverReadyFunctionSignature,
  FunctionSignature,
  TestCase,
} from "../../types/problems/problem.types";
>>>>>>> prod-deploy

export interface AiRewriteResult {
  problem: AiProblemOutput["problem"];
  publicTests: AiProblemOutput["tests"]["public"];
  hiddenTests: AiProblemOutput["tests"]["hidden"];
<<<<<<< HEAD
  rawLlmResponse: GroqJsonResponse<AiProblemOutput>["raw"];
=======
  rawLlmResponse: GeminiJsonResponse<AiProblemOutput>["raw"];
>>>>>>> prod-deploy
}

import { type ICradle } from "../../libs/awilix-container";

<<<<<<< HEAD
/**
 * Orchestrates the AI-based augmentation of imported problems.
 * Focuses on preserving narrative integrity while generating technical metadata.
 */
export class AiProblemService {
  private readonly groqLlmService: GroqLlmService;

  constructor({ groqLlmService }: ICradle) {
    this.groqLlmService = groqLlmService;
=======
function mergeSignature(
  input: ImportedProblemPayload,
  aiProblem: AiProblemOutput["problem"],
): {
  problem_type: "function" | "class" | "interactive";
  function_signature?: FunctionSignature;
  class_signature?: ClassSignature;
} {
  const problem_type =
    input.problem_type || aiProblem.problem_type || "function";

  if (problem_type === "class") {
    const class_signature = aiProblem.class_signature || input.class_signature;
    if (!class_signature) {
      throw new Error("Class-based problem missing class_signature.");
    }
    return { problem_type, class_signature };
  }

  const fromAi = aiProblem.function_signature;
  const fromInput = input.function_signature;

  const aiOk =
    (fromAi?.params?.length ?? 0) > 0 && fromAi?.name && fromAi?.return_type;
  const inputOk =
    (fromInput?.params?.length ?? 0) > 0 &&
    fromInput?.name &&
    fromInput?.return_type;

  const finalFunc = aiOk
    ? (fromAi as FunctionSignature)
    : inputOk
      ? (fromInput as FunctionSignature)
      : fromAi || fromInput;

  if (!finalFunc) {
    throw new Error(
      "AI response missing function_signature; cannot validate test cases.",
    );
  }

  return {
    problem_type: "function",
    function_signature: finalFunc as FunctionSignature,
  };
}

/**
 * Orchestrates the AI-based augmentation of imported problems.
 * Test cases are validated against a canonical type engine; on failure, one retry is attempted.
 */
export class AiProblemService {
  private readonly llm: GeminiLlmService;

  constructor({ llm }: ICradle) {
    this.llm = llm;
>>>>>>> prod-deploy
  }

  async rewriteAndGenerate(
    input: ImportedProblemPayload,
  ): Promise<AiRewriteResult> {
<<<<<<< HEAD
    // Check if solution already exists
=======
>>>>>>> prod-deploy
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
<<<<<<< HEAD
      "2. SOLUTION HANDLING:",
=======
      "2. SIGNATURE STRATEGY:",
      "   - Identify problem_type: 'function' (standard) or 'class' (Design-style, e.g., LRU Cache).",
      "   - FOR 'function': Provide 'function_signature' { name, return_type, params, inplace_param_index? }.",
      "   - IN-PLACE TARGETING: If return_type is 'void' and the problem modifies a specific parameter in-place, set 'inplace_param_index' (number). Default is 0 (first param).",
      "   - FOR 'class': Provide 'class_signature' { class_name, constructor_params, methods: [{ name, return_type, params }] }.",
      "   - return_type guidelines: Use LeetCode-style strings: int, long, double, boolean, string, char, int[], int[][], string[], ListNode, TreeNode, or List<Integer> / vector<int> style wrappers.",
      "",
      "3. JUDGING POLICY (MANDATORY):",
      "   - Always return problem.judging_policy with these fields:",
      '     * comparator_mode: "strict" | "problem_specific"',
      "     * multi_answer: boolean",
      "     * validation_policy: short machine-friendly string",
      '     * output_order: "strict" | "any_order"',
      "     * audit_hints: string[]",
      "   - For single-correct deterministic problems, use strict policy.",
      "   - For multi-answer problems (Two Sum style), set comparator_mode=problem_specific and multi_answer=true.",
      "",
      "4. TEST CASES — STRICT JSON (preferred):",
      "   - FOR 'function': Each testcase 'input' is a JSON OBJECT whose keys match signature params.",
      "   - FOR 'class': Each testcase 'input' is a JSON OBJECT: { \"commands\": [\"ClassName\", \"method1\", ...], \"arguments\": [[constructor_args], [method1_args], ...] }.",
      "   - expected_output for 'class' is a JSON ARRAY matching the commands array, with null for constructor and void methods.",
      "   - Use NATIVE JSON types:",
      "     * int / long / double: JSON number",
      "     * boolean: JSON true/false",
      "     * string / char: JSON string",
      "     * int[] / string[]: JSON array, e.g. [2,7,11,15]",
      "     * int[][] / matrix: JSON array of arrays, e.g. [[1,2,3],[4,5,6]]",
      "     * ListNode: JSON array of integers, e.g. [1,2,3]",
      "     * TreeNode: level-order JSON array with nulls, e.g. [1,null,2,3] (use JSON null, not the string \"null\", inside arrays)",
      "   - expected_output: SAME typing rules as return_type (e.g. int[] => JSON array; int => number; boolean => true/false).",
      "",
      "5. TEST QUALITY — DETERMINISM & FAIRNESS (CRITICAL):",
      "   - Every testcase must be judge-safe under strict comparison unless explicitly marked as multi-answer.",
      "   - expected_output must be deterministic for the given input.",
      "   - If multiple outputs can be correct (e.g., Two Sum), do one of the following:",
      "     A) Prefer generating inputs with a UNIQUE valid output.",
      "     B) If uniqueness cannot be guaranteed, include testcase metadata:",
      '        { "determinism_check": "multi_valid", "comparator_mode": "problem_specific" }',
      "   - Do NOT create hidden tests that require one arbitrary output when multiple are valid.",
      "   - expected_output must be mathematically/semantically valid for the provided input (never approximate).",
      "   - If expected_output is indices/positions, ensure values at those indices actually satisfy target condition.",
      "   - Perform a final self-check for each testcase before returning JSON; if any testcase fails, regenerate that testcase.",
      "   - Avoid flaky/random tests; if randomness is used, seed must be fixed and deterministic.",
      "   - Include edge cases: min/max bounds, duplicates, negatives, zeros, empty/singleton structures.",
      "",
      "6. EXAMPLE (Two Sum):",
      '   signature: { "name": "twoSum", "return_type": "int[]", "params": [{ "name": "nums", "type": "int[]" }, { "name": "target", "type": "int" }] }',
      '   testcase: { "input": { "nums": [2,7,11,15], "target": 9 }, "expected_output": [0,1] }',
      "   multi-answer caution: if nums can produce multiple valid index pairs, either regenerate input for uniqueness or mark determinism_check='multi_valid'.",
      "",
      "7. Generate EXACTLY 3 public (is_sample true) and EXACTLY 7 hidden (is_sample false) tests.",
      "   - Do not return fewer or more testcases than required.",
      "   - Keep hidden tests harder than public tests and cover edge/boundary scenarios.",
      "",
      "8. SOLUTION HANDLING:",
>>>>>>> prod-deploy
      `   - STATUS: ${shouldGenerateSolution ? "MISSING (Generate now)" : "PRESENT (Skip generation)"}`,
      "   - If MISSING, generate a solution in this EXACT Markdown format:",
      "     [TOC]",
      "     ## Video Solution",
      "     ---## Solution",
      "     ---",
      "     ### Overview",
<<<<<<< HEAD
      "     (Brief overview)",
=======
>>>>>>> prod-deploy
      "     ### Approach 1: (Name)",
      "     #### Intuition",
      "     #### Algorithm",
      "     #### Implementation (Java Fenced Code)",
      "     #### Complexity Analysis",
      "",
<<<<<<< HEAD
      "3. HINT AUGMENTATION:",
      "   - Ensure AT LEAST 5 hints total. Add new ones if necessary.",
      "",
      "4. TEST CASE GENERATION (JUDGE0/PISTON STDIN FORMAT):",
      "   - You MUST format the 'input' as raw plaintext for standard input (stdin).",
      "   - ARRAYS/LISTS: MUST be prefixed by their size on a new line.",
      "     Example for [2, 4, 3]:",
      "     3",
      "     2 4 3",
      "   - STRINGS: Return the raw string value (one per line if multiple).",
      "   - MULTIPLE INPUTS: Place each parameter on its own line in the correct order.",
      "   - EXAMPLE FORMAT for a problem with two arrays nums1=[1,3] and nums2=[2]:",
      '     "input": "2\\n1 3\\n1\\n2\\n"',
      "   - Generate 3 'public' (sample) and 10 'hidden' (comprehensive) tests.",
      "   - Ensure 'expected_output' matches exactly what the code would print to stdout.",
=======
      "9. HINTS: at least 5 hints total.",
>>>>>>> prod-deploy
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
<<<<<<< HEAD
      '    "solutions": "string (ONLY if generated)"',
      "  },",
      '  "tests": {',
      '    "public": [{ "input": "string", "expected_output": "string", "timeout_ms": 2000, "memory_limit_mb": 128, "is_sample": true }],',
      '    "hidden": [{ "input": "string", "expected_output": "string", "timeout_ms": 2000, "memory_limit_mb": 128, "is_sample": false }]',
=======
      '    "problem_type": "function" | "class" | "interactive",',
      '    "function_signature": { "name": "string", "return_type": "string", "params": [{ "name": "string", "type": "string" }] },',
      '    "class_signature": { "class_name": "string", "constructor_params": [], "methods": [] },',
      '    "judging_policy": { "comparator_mode": "strict" | "problem_specific", "multi_answer": true | false, "validation_policy": "string", "output_order": "strict" | "any_order", "audit_hints": ["string"] },',
      '    "solutions": "string (ONLY if generated)"',
      "  },",
      '  "tests": {',
      '    "public": [{ "input": {}, "expected_output": null, "timeout_ms": 2000, "memory_limit_mb": 128, "is_sample": true, "determinism_check": "unique" | "multi_valid", "comparator_mode": "strict" | "problem_specific", "comparator_notes": "string" }],',
      '    "hidden": [{ "input": {}, "expected_output": null, "timeout_ms": 2000, "memory_limit_mb": 128, "is_sample": false, "determinism_check": "unique" | "multi_valid", "comparator_mode": "strict" | "problem_specific", "comparator_notes": "string" }]',
>>>>>>> prod-deploy
      "  }",
      "}",
    ].join("\n");

<<<<<<< HEAD
    const userPrompt = [
      "Process this problem JSON and return the augmented version in JSON mode.",
      "1. Preserve original narrative fields.",
      shouldGenerateSolution
        ? "2. GENERATE solution in [TOC] format."
        : "2. Solution exists. Leave 'solutions' field null.",
      "3. Augment hints to AT LEAST 5.",
      "4. Generate 13+ test cases (3 sample, 10 hidden).",
      "5. STDIN FORMATTING: Use raw plaintext format for 'input' (size-prefixed arrays, raw strings, newlines for separate parameters).",
      "",
      "Original Data:",
      JSON.stringify({
        ...input,
        solution: undefined,
        solutions: undefined,
        description: sanitizeDescriptionForAi(
          input.description,
          SANITIZE_PROFILES.LOOSE,
        ),
      }),
    ].join("\n");

    const { data, raw } =
      await this.groqLlmService.generateJson<AiProblemOutput>({
        systemPrompt,
        userPrompt,
        temperature: 0,
        maxTokens: 8192, // Increased for problem generation
      });

    if (!data.problem) {
      throw new Error("AI response did not include a problem object");
    }

    const finalProblem = {
      ...data.problem,
      solutions: existingSolution || data.problem.solutions || "",
      // Restore narrative from original input to guarantee 100% fidelity
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

    return {
      problem: finalProblem,
      publicTests: data.tests.public,
      hiddenTests: data.tests.hidden,
      rawLlmResponse: raw,
    };
=======
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
        "2. GENERATE accurate signature (function or class) matching the problem.",
        "3. SET problem_type accurately ('function' for standard, 'class' for design).",
        shouldGenerateSolution
          ? "4. GENERATE solution in [TOC] format."
          : "4. Solution exists. Omit or null 'solutions' in output.",
        "5. At least 5 hints.",
        "6. Exactly 3 public + 7 hidden tests; inputs must match signature requirements.",
        "7. Prefer NATIVE JSON arrays/matrices for all array-typed params and for expected_output.",
        "8. Determinism rule: every testcase should be unique-answer under strict compare whenever possible.",
        "9. For multi-answer problems (e.g. Two Sum), do NOT force one arbitrary expected output unless input guarantees uniqueness.",
        "10. If a testcase is truly multi-answer, mark it with determinism_check='multi_valid' and comparator_mode='problem_specific'.",
        "11. Verify every expected_output against its input before returning; invalid testcase labels are forbidden.",
        "12. Always return problem.judging_policy with comparator_mode, multi_answer, validation_policy, output_order, and audit_hints.",
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
        judging_policy: input.judging_policy || data.problem.judging_policy || {
          comparator_mode: "strict",
          multi_answer: false,
          validation_policy: "exact_match",
          output_order: "strict",
          audit_hints: [],
        },
      };

      const mergedSig = mergeSignature(input, data.problem);

      let publicTests: TestCase[];
      let hiddenTests: TestCase[];

      if (mergedSig.problem_type === "class") {
        // For class problems, we trust the AI output for now without strict canonical normalization
        publicTests = data.tests.public as TestCase[];
        hiddenTests = data.tests.hidden as TestCase[];
      } else {
        const signature = enrichSignatureForDriver(
          mergedSig.function_signature as FunctionSignature,
        );
        try {
          const normalized = normalizeTestSuite(
            data.tests.public as any[],
            data.tests.hidden as any[],
            signature,
          );
          publicTests = normalized.publicTests;
          hiddenTests = normalized.hiddenTests;
          mergedSig.function_signature = signature;
        } catch (e: any) {
          lastValidationError = e?.message ?? String(e);
          continue;
        }
      }

      const mergedProblem = {
        ...finalProblemBase,
        ...mergedSig,
      };

      return {
        problem: mergedProblem,
        publicTests,
        hiddenTests,
        rawLlmResponse: rawAggregate ?? raw,
      };
    }

    throw new Error(
      lastValidationError ??
        "AI import failed after retries: testcase validation did not pass.",
    );
>>>>>>> prod-deploy
  }
}
