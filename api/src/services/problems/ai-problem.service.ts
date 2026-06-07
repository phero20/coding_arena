import { GeminiLlmService, type GeminiJsonResponse } from "../ai/gemini-llm.service";
import { SchemaType, Schema } from "@google/generative-ai";
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
  ClassSignature,
  DriverReadyFunctionSignature,
  FunctionSignature,
  TestCase,
} from "../../types/problems/problem.types";

export interface AiRewriteResult {
  problem: AiProblemOutput["problem"];
  rawLlmResponse: GeminiJsonResponse<AiProblemOutput>["raw"];
}

import { type ICradle } from "../../libs/awilix-container";

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
    fromAi?.params !== undefined && fromAi?.name && fromAi?.return_type;
  const inputOk =
    fromInput?.params !== undefined &&
    fromInput?.name &&
    fromInput?.return_type;

  let finalFunc: FunctionSignature | undefined;

  if (aiOk) finalFunc = fromAi as FunctionSignature;
  else if (inputOk) finalFunc = fromInput as FunctionSignature;
  else {
    throw new Error(
      "AI response missing function_signature; cannot validate test cases. RAW AI OUTPUT: " + JSON.stringify(aiProblem, null, 2),
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

  constructor({ geminiLlmService }: ICradle) {
    this.llm = geminiLlmService;
  }

  async rewriteAndGenerate(
    input: any,
  ): Promise<AiRewriteResult> {
    const problemId = input.frontend_id || input.frontendQuestionId || input.problem_id;
    const problemSlug = input.problem_slug || input.titleSlug;

    if (!problemId || !problemSlug) {
      throw new Error("Missing problem_id or problem_slug (and no fallbacks provided).");
    }

    input.problem_id = problemId;
    input.problem_slug = problemSlug;

    const isPremium = input.paidOnly === true || !input.description;

    if (isPremium) {
      const shellProblem = {
        title: input.title,
        problem_id: problemId,
        difficulty: input.difficulty || "Medium",
        problem_slug: problemSlug,
        topics: input.topics || [],
        description: input.description || "",
        examples: [],
        constraints: [],
        follow_ups: [],
        hints: [],
        code_snippets: {},
        problem_type: "function",
        is_premium: true,
      };

      return {
        problem: shellProblem as any,
        rawLlmResponse: {},
      };
    }

    const existingSolution = input.solutions || input.solution;
    const shouldGenerateSolution =
      !existingSolution || existingSolution.trim() === "";

    const systemPrompt = [
      "You are a Senior Technical Content Engineer specializing in Competitive Programming.",
      "Your goal: Augment the provided problem data with hints and accurate metadata while PRESERVING the original narrative content.",
      "",
      "=== MASTER PROTOCOL ===",
      "1. SIGNATURE STRATEGY:",
      "   - Identify problem_type: 'function' (standard) or 'class' (Design-style, e.g., LRU Cache).",
      "   - FOR 'function': Provide 'function_signature' { name, return_type, params, inplace_param_index? }.",
      "   - IN-PLACE TARGETING: If return_type is 'void' and the problem modifies a specific parameter in-place, set 'inplace_param_index' (number). Default is 0 (first param).",
      "   - FOR 'class': Provide 'class_signature' { class_name, constructor_params, methods: [{ name, return_type, params }] }.",
      "   - return_type guidelines: Use LeetCode-style strings: int, long, double, boolean, string, char, int[], int[][], string[], ListNode, TreeNode, or List<Integer> / vector<int> style wrappers.",
      "",
      "2. JUDGING POLICY (MANDATORY):",
      "   - Always return problem.judging_policy with these fields:",
      '     * comparator_mode: "strict" | "problem_specific"',
      "     * multi_answer: boolean",
      "     * validation_policy: short machine-friendly string",
      '     * output_order: "strict" | "any_order"',
      "     * audit_hints: string[]",
      "   - For single-correct deterministic problems, use strict policy.",
      "   - For multi-answer problems (Two Sum style), set comparator_mode=problem_specific and multi_answer=true.",
      "",
      "3. HINTS: Generate at least 5 helpful hints for solving the problem.",
      "",
      "=== OUTPUT SCHEMA (JSON) ===",
      "{",
      '  "problem": {',
      '    "problem_type": "function" | "class",',
      '    "hints": ["string"],',
      '    "code_snippets": { "lang_id": "string" },',
      '    "function_signature": { "name": "string", "return_type": "string", "params": [{ "name": "string", "type": "string" }] },',
      '    "class_signature": { "class_name": "string", "constructor_params": [], "methods": [] },',
      '    "judging_policy": { "comparator_mode": "strict" | "problem_specific", "multi_answer": true | false, "validation_policy": "string", "output_order": "strict" | "any_order", "audit_hints": ["string"] }',
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
        "CRITICAL INSTRUCTIONS:",
        "1. You MUST generate 'function_signature' and 'judging_policy' for normal problems.",
        "2. EXTREMELY IMPORTANT: If the problem asks to design a Class or Data Structure (like LRU Cache or Trie), you MUST set 'problem_type' to 'class' and generate a fully nested 'class_signature' object instead. DO NOT output 'function_signature' for class problems.",
        "3. You MUST generate an array of at least 5 'hints'.",
        "4. DO NOT output 'title', 'description', 'examples', or 'constraints'. Do not echo them back.",
        "5. DO NOT output 'code_snippets'.",
        lastValidationError
          ? [
              "=== PREVIOUS ATTEMPT FAILED VALIDATION ===",
              "Fix function_signature/return_type so it passes structural typing.",
              "Errors:",
              lastValidationError,
              "",
            ].join("\n")
          : "",
        "Original Data:",
        originalData,
      ];

      const userPrompt = userPromptParts.filter(Boolean).join("\n");

      const responseSchema: Schema = {
        type: SchemaType.OBJECT,
        properties: {
          problem: {
            type: SchemaType.OBJECT,
            properties: {
              problem_type: { type: SchemaType.STRING, description: "'function' or 'class'" },
              hints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              function_signature: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING },
                  return_type: { type: SchemaType.STRING },
                  params: {
                    type: SchemaType.ARRAY,
                    items: {
                      type: SchemaType.OBJECT,
                      properties: {
                        name: { type: SchemaType.STRING },
                        type: { type: SchemaType.STRING }
                      }
                    }
                  },
                  inplace_param_index: { type: SchemaType.INTEGER }
                }
              },
              class_signature: {
                type: SchemaType.OBJECT,
                properties: {
                  class_name: { type: SchemaType.STRING },
                  constructor_params: {
                    type: SchemaType.ARRAY,
                    items: {
                      type: SchemaType.OBJECT,
                      properties: { name: { type: SchemaType.STRING }, type: { type: SchemaType.STRING } }
                    }
                  },
                  methods: {
                    type: SchemaType.ARRAY,
                    items: {
                      type: SchemaType.OBJECT,
                      properties: {
                        name: { type: SchemaType.STRING },
                        return_type: { type: SchemaType.STRING },
                        params: {
                          type: SchemaType.ARRAY,
                          items: {
                            type: SchemaType.OBJECT,
                            properties: { name: { type: SchemaType.STRING }, type: { type: SchemaType.STRING } }
                          }
                        }
                      }
                    }
                  }
                }
              },
              judging_policy: {
                type: SchemaType.OBJECT,
                properties: {
                  comparator_mode: { type: SchemaType.STRING, description: "'strict' or 'problem_specific'" },
                  multi_answer: { type: SchemaType.BOOLEAN },
                  validation_policy: { type: SchemaType.STRING },
                  output_order: { type: SchemaType.STRING, description: "'strict' or 'any_order'" },
                  audit_hints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                }
              }
            }
          }
        }
      };

      const { data, raw } =
        await this.llm.generateJson<AiProblemOutput>({
          systemPrompt,
          userPrompt,
          temperature: 0.1,
          // We disable responseSchema here because Gemini's Structured Outputs enforces optional fields greedily
          // which causes flash models to truncate the JSON prematurely when encountering complex branching (function vs class).
          // Relying on responseMimeType: "application/json" and the text prompt works much better for conditional JSON.
        });

      rawAggregate = raw;

      if (!data.problem) {
        throw new Error("AI response did not include a problem object");
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

      const mergedProblem = {
        ...finalProblemBase,
        ...mergedSig,
      };

      return {
        problem: mergedProblem,
        rawLlmResponse: rawAggregate ?? raw,
      };
    }

    throw new Error(
      lastValidationError ??
        "AI import failed after retries: testcase validation did not pass.",
    );
  }
}
