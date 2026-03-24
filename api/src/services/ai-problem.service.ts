import type { GroqJsonResponse } from "./groq-llm.service";
import { GroqLlmService } from "./groq-llm.service";
import type {
  AiProblemOutput,
  ImportedProblemPayload,
} from "../types/problem-import.types";

export interface AiRewriteResult {
  problem: AiProblemOutput["problem"];
  publicTests: AiProblemOutput["tests"]["public"];
  hiddenTests: AiProblemOutput["tests"]["hidden"];
  rawLlmResponse: GroqJsonResponse<AiProblemOutput>["raw"];
}

/**
 * Orchestrates the AI-based augmentation of imported problems.
 * Focuses on preserving narrative integrity while generating technical metadata.
 */
export class AiProblemService {
  constructor(private readonly llm: GroqLlmService = new GroqLlmService()) {}

  async rewriteAndGenerate(
    input: ImportedProblemPayload,
  ): Promise<AiRewriteResult> {
    // Check if solution already exists
    const existingSolution = input.solutions || input.solution;
    const shouldGenerateSolution = !existingSolution || existingSolution.trim() === "";

    const systemPrompt = [
      "You are a Senior Technical Content Engineer specializing in Competitive Programming.",
      "Your goal: Augment the provided problem data with hints, test cases, and solutions while PRESERVING the original narrative content.",
      "",
      "=== MASTER PROTOCOL ===",
      "1. PRESERVE ORIGINAL FIELDS (CRITICAL):",
      "   - Return these exactly as they appear in input: 'title', 'difficulty', 'problem_slug', 'topics', 'description', 'examples', 'constraints', 'follow_ups', 'code_snippets'.",
      "",
      "2. SOLUTION HANDLING:",
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
      '    "solutions": "string (ONLY if generated)"',
      "  },",
      '  "tests": {',
      '    "public": [{ "input": "string", "expected_output": "string", "timeout_ms": 2000, "memory_limit_mb": 128, "is_sample": true }],',
      '    "hidden": [{ "input": "string", "expected_output": "string", "timeout_ms": 2000, "memory_limit_mb": 128, "is_sample": false }]',
      "  }",
      "}",
    ].join("\n");

    const userPrompt = [
      "Process this problem JSON and return the augmented version in JSON mode.",
      "1. Preserve original narrative fields.",
      shouldGenerateSolution ? "2. GENERATE solution in [TOC] format." : "2. Solution exists. Leave 'solutions' field null.",
      "3. Augment hints to AT LEAST 5.",
      "4. Generate 13+ test cases (3 sample, 10 hidden).",
      "5. STDIN FORMATTING: Use raw plaintext format for 'input' (size-prefixed arrays, raw strings, newlines for separate parameters).",
      "",
      "Original Data:",
      JSON.stringify({ ...input, solution: undefined, solutions: undefined }),
    ].join("\n");

    const { data, raw } = await this.llm.generateJson<AiProblemOutput>({
      systemPrompt,
      userPrompt,
      temperature: 0,
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
  }
}
