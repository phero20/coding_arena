import { GeminiLlmService, type GeminiJsonResponse } from "../ai/gemini-llm.service";
import type {
  AiProblemOutput,
  ImportedProblemPayload,
} from "../../types/problems/problem-import.types";
import {
  sanitizeDescriptionForAi,
  SANITIZE_PROFILES,
} from "../../libs/security/prompt-sanitizer";

export interface AiRewriteResult {
  problem: AiProblemOutput["problem"];
  publicTests: AiProblemOutput["tests"]["public"];
  hiddenTests: AiProblemOutput["tests"]["hidden"];
  rawLlmResponse: GeminiJsonResponse<AiProblemOutput>["raw"];
}

import { type ICradle } from "../../libs/awilix-container";

/**
 * Orchestrates the AI-based augmentation of imported problems.
 * Focuses on preserving narrative integrity while generating technical metadata.
 */
export class AiProblemService {
  private readonly llm: GeminiLlmService;

  constructor({ llm }: ICradle) {
    this.llm = llm;
  }

  async rewriteAndGenerate(
    input: ImportedProblemPayload,
  ): Promise<AiRewriteResult> {
    // Check if solution already exists
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
      "2. FUNCTION SIGNATURE GENERATION:",
      "   - You MUST generate a 'function_signature' object that defines how the user's code should be called.",
      "   - return_type: Use standard types like 'int', 'string', 'boolean', 'int[]', 'string[]', 'ListNode', 'TreeNode'.",
      "   - params: An array of { name: string, type: string } matching the problem requirements.",
      "",
      "3. TEST CASE GENERATION (STRUCTURED JSON):",
      "   - You MUST format 'input' as a JSON object for EVERY test case.",
      "   - CRITICAL: The 'input' object MUST contain ALL keys defined in your 'function_signature.params'.",
      "   - JSON TYPE ENFORCEMENT:",
      "     * CRITICAL: For any 'int[]' or 'long[]' parameters, DO NOT output a JSON array.",
      "     * Instead, output a COMMA-SEPARATED STRING: \"2, 7, 11, 15\".",
      "     * This prevents tokenization compression. The backend will convert it back to an array.",
      "   - FEW-SHOT EXAMPLE:",
      "     * INPUT: \"nums = [2,7,11,15], target = 9\"",
      "     * SIGNATURE: { \"name\": \"twoSum\", \"return_type\": \"int[]\", \"params\": [{\"name\": \"nums\", \"type\": \"int[]\"}, {\"name\": \"target\", \"type\": \"int\"}] }",
      "     * OUTPUT TEST CASE: { \"input\": { \"nums\": \"2, 7, 11, 15\", \"target\": 9 }, \"expected_output\": \"0, 1\" }",
      "   - Generate 3 'public' (sample) and 10 'hidden' (comprehensive) tests.",
      "",
      "4. SOLUTION HANDLING:",
      `   - STATUS: ${shouldGenerateSolution ? "MISSING (Generate now)" : "PRESENT (Skip generation)"}`,
      "   - If MISSING, generate a solution in this EXACT Markdown format:",
      "     [TOC]",
      "     ## Video Solution",
      "     ---## Solution",
      "     ---",
      "     ### Overview",
      "     (Brief overview)",
      "     ### Approach 1: (Name)",
      "     #### Intuition",
      "     #### Algorithm",
      "     #### Implementation (Java Fenced Code)",
      "     #### Complexity Analysis",
      "",
      "5. HINT AUGMENTATION:",
      "   - Ensure AT LEAST 5 hints total. Add new ones if necessary.",
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
      '    "public": [{ "input": {}, "expected_output": any, "timeout_ms": 2000, "memory_limit_mb": 128, "is_sample": true }],',
      '    "hidden": [{ "input": {}, "expected_output": any, "timeout_ms": 2000, "memory_limit_mb": 128, "is_sample": false }]',
      "  }",
      "}",
    ].join("\n");

    const userPromptParts = [
      "Process this problem JSON and return the augmented version in JSON mode.",
      "1. Preserve original narrative fields.",
      "2. GENERATE accurate 'function_signature'.",
      shouldGenerateSolution
        ? "3. GENERATE solution in [TOC] format."
        : "3. Solution exists. Leave 'solutions' field null.",
      "4. Augment hints to AT LEAST 5.",
      "5. Generate 13+ test cases (3 sample, 10 hidden).",
      "6. STRUCTURED INPUTS: Use JSON objects for 'input' matching the signature params.",
      "",
      "Original Data:",
    ];

    const originalData = JSON.stringify({
      ...input,
      solution: undefined,
      solutions: undefined,
      description: sanitizeDescriptionForAi(
        input.description,
        SANITIZE_PROFILES.LOOSE,
      ),
    });

    const userPrompt = [...userPromptParts, originalData].join("\n");

    console.log("DEBUG: Final User Prompt for Groq:", userPrompt);

    const { data, raw } =
      await this.llm.generateJson<AiProblemOutput>({
        systemPrompt,
        userPrompt,
        temperature: 0,
        maxTokens: 8192,
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
      function_signature: input.function_signature || data.problem.function_signature,
    };

    // Expand comma-separated strings back into arrays based on type signature
    const expandTests = (tests: any[]) => {
      const sig = finalProblem.function_signature;
      if (!sig) return tests;

      const isArrayType = (type: string) => type.endsWith("[]");
      const isNumericType = (type: string) => 
        type === "int" || type === "int[]" || type === "long" || type === "long[]" || type === "double" || type === "double[]";

      return tests.map((t) => {
        const expandedInput: any = { ...t.input };
        
        // Expand Inputs
        sig.params.forEach(param => {
          let val = expandedInput[param.name];
          if (isArrayType(param.type) && typeof val === "string") {
            // Split by comma and trim
            const parts = val.split(",").map(s => s.trim()).filter(s => s !== "");
            if (isNumericType(param.type)) {
              expandedInput[param.name] = parts.map(Number);
            } else {
              expandedInput[param.name] = parts;
            }
          } else if (isNumericType(param.type) && typeof val === "string") {
             expandedInput[param.name] = Number(val);
          }
        });

        // Expand Expected Output
        let expandedOutput = t.expected_output;
        if (isArrayType(sig.return_type) && typeof expandedOutput === "string") {
          const parts = expandedOutput.split(",").map(s => s.trim()).filter(s => s !== "");
          if (isNumericType(sig.return_type)) {
            expandedOutput = parts.map(Number);
          } else {
            expandedOutput = parts;
          }
        } else if (isNumericType(sig.return_type) && typeof expandedOutput === "string") {
          expandedOutput = Number(expandedOutput);
        }

        return {
          ...t,
          input: expandedInput,
          expected_output: expandedOutput,
        };
      });
    };

    return {
      problem: finalProblem,
      publicTests: expandTests(data.tests.public),
      hiddenTests: expandTests(data.tests.hidden),
      rawLlmResponse: raw,
    };
  }
}
