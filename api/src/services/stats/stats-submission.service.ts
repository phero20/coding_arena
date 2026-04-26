import { createLogger } from "../../libs/utils/logger";
import { type ICradle } from "../../libs/awilix-container";
import type { IStatsRepository } from "../../repositories/stats/stats.repository";
import type { IProblemRepository } from "../../repositories/problems/problem.repository";
import type { IUserRepository } from "../../repositories/user/user.repository";
import type { Submission } from "../../types/submissions/submission.types";
import { type IStatsService } from "./stats.service";


const logger = createLogger("stats-submission-service");

export class StatsSubmissionService {
  private readonly statsRepository: IStatsRepository;
  private readonly problemRepository: IProblemRepository;
  private readonly userRepository: IUserRepository;
  private readonly statsService: IStatsService;

  constructor({
    statsRepository,
    problemRepository,
    userRepository,
    statsService,
  }: ICradle) {
    this.statsRepository = statsRepository;
    this.problemRepository = problemRepository;
    this.userRepository = userRepository;
    this.statsService = statsService;
  }


  /**
   * Orchestrates all analytics updates following a submission status change.
   * Handles activity logging, point allocation, and unique solve tracking.
   */
  async handleSubmissionUpdate(submission: Submission): Promise<void> {
    logger.info(
      {
        submissionId: submission.id,
        userId: submission.userId,
        status: submission.status,
      },
      "Starting stats update flow",
    );
    try {
      // 1. Resolve ID to Postgres User (Smart Lookup)
      let user = await this.userRepository.findByClerkId(submission.userId);

      if (!user) {
        logger.info(
          { clerkId: submission.userId },
          "User not found by clerkId, trying internal ID...",
        );
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
      logger.info(
        { postgresUserId, clerkId: user.clerkId },
        "Identity resolved successfully",
      );

      // 2. Track activity (log today's submission attempt)
      logger.info({ postgresUserId }, "Logging daily submission activity...");
      await this.statsRepository.logActivity(
        postgresUserId,
        0,
        0, // arenaPointsEarned (none for basic submission log)
        true, // isSubmission
        false, // isMatch
      );

      // 3. If the submission was just ACCEPTED, handle points and counts
      if (submission.status === "ACCEPTED") {
        logger.info(
          { submissionId: submission.id },
          "Submission is ACCEPTED. Processing points...",
        );
        await this.processAcceptedSolve(submission, postgresUserId);
      } else {
        logger.info(
          { status: submission.status },
          "Submission not accepted, skipping points.",
        );
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
    logger.info(
      { problemId: submission.problemId },
      "Fetching problem details from MongoDB...",
    );
    const problem = await this.problemRepository.findByProblemId(
      submission.problemId,
    );
    if (!problem) {
      logger.error(
        { problemId: submission.problemId },
        "CRITICAL: Problem not found in MongoDB. Stats update aborted.",
      );
      return;
    }

    // Use Postgres 'ON CONFLICT' to atomically check if this is the first solve
    logger.info(
      { postgresUserId, problemId: submission.problemId },
      "Checking if this is a unique solve in Postgres...",
    );
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

      logger.info(
        { userId: postgresUserId, difficulty, points },
        "Unique solve confirmed! Awarding points...",
      );

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
        0,
        false,
        false,
      );

      logger.info(
        { userId: postgresUserId, problemId: submission.problemId, points },
        "Postgres unique problem stats updated successfully ✅",
      );
    } else {
      logger.info(
        { userId: postgresUserId, problemId: submission.problemId },
        "User already solved this problem uniquely. No new points awarded.",
      );
    }

    // Update Solve Streak - runs on every ACCEPTED solve (any problem)
    logger.info({ userId: postgresUserId }, "Updating user solve streak...");
    await this.statsRepository.updateStreak(postgresUserId);

    // Invalidate User Stats Cache via modular service
    await this.statsService.invalidateProfile(postgresUserId);


    // Language counter — runs on every ACCEPTED, gated by its own (problem, language) dedup.
    // Separate from isNewSolve so solving the same problem in a new language still counts.
    if (submission.languageId) {
      logger.info(
        {
          userId: postgresUserId,
          problemId: submission.problemId,
          languageId: submission.languageId,
        },
        "Processing language solve recording...",
      );
      const isNewLang = await this.statsRepository.recordSolvedLanguage(
        postgresUserId,
        submission.problemId,
        submission.languageId,
      );

      if (isNewLang) {
        logger.info(
          { userId: postgresUserId, languageId: submission.languageId },
          "New language solve detected! Incrementing counter...",
        );
        await this.statsRepository.updateLanguageCount(
          postgresUserId,
          submission.languageId,
        );
      } else {
        logger.info(
          { userId: postgresUserId, languageId: submission.languageId },
          "Language solve already recorded for this problem. Skipping counter.",
        );
      }
    } else {
      logger.warn(
        { submissionId: submission.id },
        "Submission languageId is missing. Language counter skipped.",
      );
    }
  }

  /**
   * Orchestrates Postgres updates for all participants when an Arena match is finalized.
   * Awards bonus points based on RANK and participation length.
   * Formula: (Total Participants - Rank + 1) * 25
   */
  async handleArenaMatchFinalization(
    rankedPlayers: Array<{ userId: string }>,
  ): Promise<void> {
    const totalPlayers = rankedPlayers.length;

    logger.info(
      { totalPlayers },
      "Processing ranked stats for finalized Arena match",
    );

    // Process all players in their rank order
    await Promise.all(
      rankedPlayers.map(async (player, index) => {
        try {
          const rank = index + 1;
          const arenaBonusPoints = (totalPlayers - rank + 1) * 25;

          // Resolve identity (Clerk ID -> Postgres UUID)
          let user = await this.userRepository.findByClerkId(player.userId);
          if (!user) {
            user = await this.userRepository.findById(player.userId);
          }

          if (!user) {
            logger.warn(
              { userId: player.userId, rank },
              "Could not resolve Postgres User ID for Arena player. Skipping.",
            );
            return;
          }

          const postgresUserId = user.id;

          // 1. Update Core Stats (Increment games and dual-write points)
          await this.statsRepository.updateUserStats({
            userId: postgresUserId,
            points: arenaBonusPoints, // Still adds to the global total
            arenaPoints: arenaBonusPoints, // Adds to the exclusive Arena pool
            isMatch: true,
            // difficulty is undefined -> don't double-count solve count
          });

          // 2. Log Activity (Increment match count and add rank-based bonus)
          await this.statsRepository.logActivity(
            postgresUserId,
            arenaBonusPoints,
            arenaBonusPoints, // arenaPointsEarned
            false, // isSubmission = false
            true, // isMatch = true
          );

          logger.info(
            { postgresUserId, rank, points: arenaBonusPoints },
            "Arena stats updated for ranked player",
          );

          // 3. Invalidate User Stats Cache so the new rank/points show up instantly
          await this.statsService.invalidateProfile(postgresUserId);
        } catch (err) {
          logger.error(
            { userId: player.userId, err },
            "Failed to update Arena stats for ranked player",
          );
        }
      }),
    );
  }
}
