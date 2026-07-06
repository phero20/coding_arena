import { type ILlmService, type LlmJsonResponse } from "../ai/llm.service";
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
  rawLlmResponse: LlmJsonResponse<AiProblemOutput>["raw"];
}

import { AI_PROBLEM_SYSTEM_PROMPT, buildAiProblemUserPrompt } from "../../libs/prompts/ai-problem.prompt";
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
  private readonly llm: ILlmService;

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

    const systemPrompt = AI_PROBLEM_SYSTEM_PROMPT;

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
    let rawAggregate: LlmJsonResponse<AiProblemOutput>["raw"] | undefined;

    for (let attempt = 0; attempt < 2; attempt++) {
      const userPrompt = buildAiProblemUserPrompt(lastValidationError, originalData);



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
