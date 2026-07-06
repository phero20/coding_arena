import { type ILlmService } from "../ai/llm.service";
import { createLogger } from "../../libs/utils/logger";

import { AI_ADDSOLVE_SYSTEM_PROMPT, buildAiAddsolveUserPrompt } from "../../libs/prompts/ai-addsolve.prompt";
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
    // Strip HTML tags from description to reduce unnecessary input tokens
    const cleanDescription =
      problem.description?.replace(/<[^>]*>?/gm, "") ||
      "No description provided.";

    const systemPrompt = AI_ADDSOLVE_SYSTEM_PROMPT;

    const userPrompt = buildAiAddsolveUserPrompt(
      problem.title,
      problem.difficulty,
      cleanDescription,
      JSON.stringify({ func: problem.function_signature, cls: problem.class_signature }, null, 2),
      JSON.stringify(problem.judging_policy || {}, null, 2)
    );

    return { systemPrompt, userPrompt };
  }
}
