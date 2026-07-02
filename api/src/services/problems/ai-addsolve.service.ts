import { type ILlmService } from "../ai/llm.service";
import { createLogger } from "../../libs/utils/logger";
import { AppError } from "../../utils/app-error";
import { ERRORS } from "../../constants/errors";
import { type ICradle } from "../../libs/awilix-container";
import type { IProblemRepository } from "../../repositories/problems/problem.repository";
import type { Problem } from "../../types/problems/problem.types";

export class AiAddSolveService {
  private readonly logger = createLogger("ai-addsolve-service");
  private readonly problemRepo: IProblemRepository;
  private readonly geminiLlmService: ILlmService;

  constructor({ problemRepository, geminiLlmService }: ICradle) {
    this.problemRepo = problemRepository;
    this.geminiLlmService = geminiLlmService;
  }

  /**
   * Fetches a single problem by ID, generates AI solutions + signature/policy fixes
   * via Amazon Bedrock, and persists the result to the database.
   */
  public async processSingleProblem(problemId: string) {
    this.logger.info({ problemId }, "Starting AI solution generation");

    const problem = await this.problemRepo.findByProblemId(problemId);

    if (!problem) {
      this.logger.warn(
        { problemId },
        "Problem not found — aborting generation",
      );
      throw AppError.from(ERRORS.PROBLEM.NOT_FOUND, { problemId });
    }

    if (problem.is_premium) {
      this.logger.warn(
        { problemId },
        "Problem is premium — skipping generation",
      );
      throw AppError.badRequest(
        `Problem ${problemId} is premium and cannot be auto-generated.`,
      );
    }

    this.logger.info(
      { problemId, title: problem.title },
      "Problem fetched — invoking Bedrock",
    );

    // 1. Build the prompt
    const { systemPrompt, userPrompt } = this.buildPrompt(problem);

    // 2. Call Gemini Llm Service with Retries and Fallback
    const MAX_RETRIES = 3;
    let parsedOutput: any = null;
    let success = false;
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        this.logger.info(
          { problemId, attempt },
          "Invoking PRIMARY model (gemini-2.5-pro)",
        );
        const res = await this.geminiLlmService.generateJson<any>({
          systemPrompt,
          userPrompt,
          temperature: 0.1,
          model: "gemini-2.5-pro",
        });
        parsedOutput = res.data;
        success = true;
        break;
      } catch (err: any) {
        lastError = err;
        this.logger.warn(
          { problemId, attempt, error: err.message },
          "Primary Gemini model failed or returned invalid JSON",
        );
      }
    }

    if (!success) {
      this.logger.info(
        { problemId },
        "Primary Gemini model failed all retries. Falling back to FALLBACK model (gemini-2.5-flash)",
      );
      try {
        const res = await this.geminiLlmService.generateJson<any>({
          systemPrompt,
          userPrompt,
          temperature: 0.1,
          model: "gemini-2.5-flash",
        });
        parsedOutput = res.data;
        success = true;
      } catch (err: any) {
        lastError = err;
        this.logger.error(
          { problemId, error: err.message },
          "Fallback Gemini model also failed",
        );
      }
    }

    if (!success || !parsedOutput) {
      throw AppError.internal(
        "AI response failed or did not contain a valid JSON object after all retries and fallbacks.",
        { problemId, cause: lastError?.message },
      );
    }

    // 5. Apply changes
    let shouldUpdate = false;
    const updatedProblem = { ...problem };

    if (parsedOutput.is_signature_inaccurate && parsedOutput.fixed_signature) {
      this.logger.info({ problemId }, "Applying AI-suggested signature fix");
      updatedProblem.problem_type =
        parsedOutput.fixed_signature.type || problem.problem_type;
      updatedProblem.function_signature =
        parsedOutput.fixed_signature.function_signature;
      updatedProblem.class_signature =
        parsedOutput.fixed_signature.class_signature;
      shouldUpdate = true;
    }

    if (parsedOutput.fixed_judging_policy) {
      this.logger.info(
        { problemId },
        "Applying AI-suggested judging policy update",
      );
      updatedProblem.judging_policy = parsedOutput.fixed_judging_policy;
      shouldUpdate = true;
    }

    if (parsedOutput.solutions && parsedOutput.solutions.length > 0) {
      this.logger.info(
        { problemId, count: parsedOutput.solutions.length },
        "Saving generated solutions",
      );
      // Schema field is String — store as serialized JSON so frontend can JSON.parse on demand
      updatedProblem.solutions = JSON.stringify(parsedOutput.solutions);
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      await this.problemRepo.createOrUpdate(updatedProblem);
      this.logger.info({ problemId }, "Problem updated successfully in DB");
    } else {
      this.logger.warn({ problemId }, "No changes detected — DB not updated");
    }

    return updatedProblem;
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  /**
   * Builds the structured prompt sent to Claude 3.5 Sonnet on Bedrock.
   */
  private buildPrompt(problem: Problem): { systemPrompt: string; userPrompt: string } {
    const jsonStructureExample = {
      is_signature_inaccurate: false,
      fixed_judging_policy: {
        comparator_mode: "strict",
        multi_answer: false,
        output_order: "any_order",
      },
      solutions: [
        {
          language: "java",
          approach_name: "Brute Force",
          time_complexity: "O(N^2)",
          space_complexity: "O(1)",
          editorial_explanation:
            "## Intuition\n\nExplain the core idea here.\n\n## Algorithm\n\nStep-by-step walkthrough.\n\n## Complexity\n\n- **Time:** O(N^2)\n- **Space:** O(1)",
          code: "class Solution {\n    public int exampleFunc(int arg1) {\n        return arg1;\n    }\n}",
        },
        {
          language: "java",
          approach_name: "Optimal Two Pointer",
          time_complexity: "O(N)",
          space_complexity: "O(1)",
          editorial_explanation:
            "## Intuition\n\nExplain the optimal approach here.\n\n## Algorithm\n\nStep-by-step walkthrough.\n\n## Complexity\n\n- **Time:** O(N)\n- **Space:** O(1)",
          code: "class Solution {\n    public int exampleFunc(int arg1) {\n        return arg1;\n    }\n}",
        },
      ],
    };

    // Strip HTML tags from description to reduce unnecessary input tokens
    const cleanDescription =
      problem.description?.replace(/<[^>]*>?/gm, "") ||
      "No description provided.";

    const systemPrompt = `
You are an expert competitive programmer and algorithmic engineer.
Review the following problem, its current signature, and its judging policy.

IMPORTANT: The problem description below is the absolute source of truth.
If the problem title matches a well-known competitive programming problem, you MAY use that background knowledge ONLY if it is fully consistent with the provided description. If there is any conflict, always defer to the description.

CRITICAL RULES:
1. Do NOT suggest changes to the problem title, description, hints, or any other fields.
2. ONLY evaluate the function/class signature and the judging policy.
3. Each approach is ONE distinct algorithmic idea.
4. ALL code implementations MUST be written in "java". Do NOT use any other language.
5. Do NOT include reasoning. Do NOT include <reasoning> tags. Do NOT explain your thought process. Output ONLY valid JSON.
6. EXTREME WARNING ON COMPLEXITY: Your Time and Space complexity evaluations MUST be 100% mathematically accurate. Think step-by-step about the worst-case scenario. Do NOT guess. If you use recursion, you MUST account for the call stack in space complexity. If you sort, you MUST account for O(N log N) time.

TASK 1: Verify the signature. If it is mathematically wrong, missing arguments, or inaccurate for the problem description, fix it according to the schema. If the existing signature matches the description, return:
"is_signature_inaccurate": false
and do NOT regenerate the signature details (omit fixed_signature entirely).
TASK 2: Verify the judging_policy. If the problem requires returning values in any order (e.g. "return elements in any order"), set output_order to "any_order". Always return this field.
TASK 3: Generate ONE or TWO distinct solution approaches depending on the problem difficulty and nature.
  - Choose approaches WISELY and ACCURATELY based on the problem. Do NOT hallucinate.
  - For HARD problems, a "Brute Force" approach is often useless. Instead, provide 2 advanced approaches (e.g., Memoization → Bottom-Up DP, or Bottom-Up DP → Space-Optimized DP).
  - For MEDIUM problems, you might provide a Sub-optimal approach → Optimal approach.
  - If only ONE meaningful approach exists, return exactly ONE approach.
  - Do NOT invent additional approaches simply to increase the count.
  - Only include approaches that provide genuine educational value.
  For EACH approach, provide:
  - approach_name: A short name (e.g. "Memoization", "Space-Optimized DP", "Two Pointer")
  - time_complexity: EXACT and ACCURATE Big-O notation (e.g., "O(N log N)", "O(N * M)"). WARNING: Double check nested loops, sorting, and recursive calls.
  - space_complexity: EXACT and ACCURATE Big-O notation (e.g., "O(1)", "O(N)"). WARNING: Double check auxiliary arrays, hash maps, and recursion call stack depth.
  - editorial_explanation: A rich GitHub Flavored Markdown string with ## Intuition, ## Algorithm, and ## Complexity sections
  - language: MUST be "java"
  - code: The full executable Java implementation of THIS approach.

CRITICAL INSTRUCTION: You MUST return your response as a raw, valid JSON object. Do NOT wrap the JSON in markdown code blocks (\`\`\`json). Return purely the JSON text, following this exact structure:
${JSON.stringify(jsonStructureExample, null, 2)}
`;

    const userPrompt = `
PROBLEM TITLE: ${problem.title}
PROBLEM DIFFICULTY: ${problem.difficulty}
PROBLEM DESCRIPTION:
${cleanDescription}

CURRENT SIGNATURE:
${JSON.stringify({ func: problem.function_signature, cls: problem.class_signature }, null, 2)}

CURRENT JUDGING POLICY:
${JSON.stringify(problem.judging_policy || {}, null, 2)}
`;

    return { systemPrompt, userPrompt };
  }
}
