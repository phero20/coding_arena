import { createLogger } from "../../libs/utils/logger";
import { type ICradle } from "../../libs/awilix-container";
import type { IStatsRepository } from "../../repositories/stats/stats.repository";
import type { IProblemRepository } from "../../repositories/problems/problem.repository";
import type { IUserRepository } from "../../repositories/user/user.repository";
import type { Submission } from "../../types/submissions/submission.types";

const logger = createLogger("stats-submission-service");

export class StatsSubmissionService {
  private readonly statsRepository: IStatsRepository;
  private readonly problemRepository: IProblemRepository;
  private readonly userRepository: IUserRepository;

  constructor({ statsRepository, problemRepository, userRepository }: ICradle) {
    this.statsRepository = statsRepository;
    this.problemRepository = problemRepository;
    this.userRepository = userRepository;
  }

  /**
   * Orchestrates all analytics updates following a submission status change.
   * Handles activity logging, point allocation, and unique solve tracking.
   */
  async handleSubmissionUpdate(submission: Submission): Promise<void> {
    logger.info({ submissionId: submission.id, userId: submission.userId, status: submission.status }, "Starting stats update flow");
    try {
      // 1. Resolve ID to Postgres User (Smart Lookup)
      let user = await this.userRepository.findByClerkId(submission.userId);
      
      if (!user) {
        logger.info({ clerkId: submission.userId }, "User not found by clerkId, trying internal ID...");
        user = await this.userRepository.findById(submission.userId);
      }

      if (!user) {
        logger.error(
          { userId: submission.userId, submissionId: submission.id },
          "CRITICAL: User not found in Postgres by Clerk ID or internal ID. Stats skipped.",
        );
        return;
      }

      const postgresUserId = user.id;
      logger.info({ postgresUserId, clerkId: user.clerkId }, "Identity resolved successfully");

      // 2. Track activity (log today's submission attempt)
      logger.info({ postgresUserId }, "Logging daily submission activity...");
      await this.statsRepository.logActivity(
        postgresUserId,
        0,
        true, // isSubmission
        false, // isMatch
      );

      // 3. If the submission was just ACCEPTED, handle points and counts
      if (submission.status === "ACCEPTED") {
        logger.info({ submissionId: submission.id }, "Submission is ACCEPTED. Processing points...");
        await this.processAcceptedSolve(submission, postgresUserId);
      } else {
        logger.info({ status: submission.status }, "Submission not accepted, skipping points.");
      }
    } catch (err) {
      logger.error(
        {
          err,
          submissionId: submission.id,
          inputUserId: submission.userId,
        },
        "Failed to process analytics for submission update",
      );
    }
  }

  private async processAcceptedSolve(
    submission: Submission,
    postgresUserId: string,
  ): Promise<void> {
    logger.info({ problemId: submission.problemId }, "Fetching problem details from MongoDB...");
    const problem = await this.problemRepository.findByProblemId(
      submission.problemId,
    );
    if (!problem) {
      logger.error({ problemId: submission.problemId }, "CRITICAL: Problem not found in MongoDB. Stats update aborted.");
      return;
    }

    // Use Postgres 'ON CONFLICT' to atomically check if this is the first solve
    logger.info({ postgresUserId, problemId: submission.problemId }, "Checking if this is a unique solve in Postgres...");
    const isNewSolve = await this.statsRepository.recordSolvedProblem(
      postgresUserId,
      submission.problemId,
    );

    if (isNewSolve) {
      const difficulty = (problem.difficulty?.toLowerCase() || "easy") as
        | "easy"
        | "medium"
        | "hard";

      // Point Mapping
      const points =
        difficulty === "hard" ? 100 : difficulty === "medium" ? 30 : 10;

      logger.info({ difficulty, points }, "Unique solve confirmed! Awarding points...");

      // Update Total Performance Stats
      await this.statsRepository.updateUserStats({
        userId: postgresUserId,
        points,
        difficulty,
        isMatch: false,
      });

      // Credit the earned points to today's activity log
      await this.statsRepository.logActivity(
        postgresUserId,
        points,
        false, // Already counted as submission above
        false,
      );

      logger.info(
        { userId: postgresUserId, problemId: submission.problemId, points },
        "Postgres stats updated successfully ✅",
      );
    } else {
      logger.info({ userId: postgresUserId, problemId: submission.problemId }, "User already solved this problem. No new points awarded.");
    }
  }
}
