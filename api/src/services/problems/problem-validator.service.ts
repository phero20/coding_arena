import type { ProblemRepository } from "../../repositories/problems/problem.repository";
import { AppError } from "../../utils/app-error";
import { ERRORS } from "../../constants/errors";
import { createLogger } from "../../libs/utils/logger";

import { type ICradle } from "../../libs/awilix-container";

/**
 * ProblemValidatorService centralizes validation logic for problem-related actions.
 */
export class ProblemValidatorService {
  private readonly logger = createLogger("problem-validator-service");
  private readonly problemRepository: ProblemRepository;

  constructor({ problemRepository }: ICradle) {
    this.problemRepository = problemRepository;
  }

  /**
   * Ensures a problem exists before proceeding with actions like submission or retrieval.
   * Checks by internal alphanumeric problem_id (e.g., "1" or "p1").
   */
  async validateProblemExists(problemId: string): Promise<any> {
    const problem = await this.problemRepository.findByProblemId(problemId);
    if (!problem) {
      this.logger.warn({ problemId }, "Validation Failed: Problem not found.");
      throw AppError.from(ERRORS.PROBLEM.NOT_FOUND);
    }
    return problem;
  }

  /**
   * Checks existence by URL slug.
   */
  async validateProblemBySlug(slug: string): Promise<any> {
    const problem = await this.problemRepository.findBySlug(slug);
    if (!problem) {
      this.logger.warn({ slug }, "Validation Failed: Problem slug not found.");
      throw AppError.from(ERRORS.PROBLEM.NOT_FOUND);
    }
    return problem;
  }
}
