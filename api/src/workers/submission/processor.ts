import type { Job } from "bullmq";
import type {
  SubmissionEvaluationJob,
  SubmissionEvaluationResult,
} from "../../types/queue.types";
import type { SubmissionRepository } from "../../repositories/submission.repository";
import type { ArenaMatchRepository } from "../../repositories/arena-match.repository";
import type { ArenaSubmissionRepository } from "../../repositories/arena-submission.repository";
import type { ArenaRepository } from "../../repositories/arena.repository";
import type { ExecutionTestResult } from "../../libs/verdict.util";
import { SubmissionEvaluator } from "./evaluator";
import * as arenaRedis from "../../libs/arena-redis";
import { config } from "../../configs/env";
import { createLogger } from "../../libs/logger";

const logger = createLogger("submission-processor");

export function createSubmissionProcessor(
  submissionRepository: SubmissionRepository,
  arenaMatchRepository: ArenaMatchRepository,
  arenaSubmissionRepository: ArenaSubmissionRepository,
  arenaRepository: ArenaRepository,
  evaluator: SubmissionEvaluator,
) {
  return async function processSubmissionJob(
    job: Job<SubmissionEvaluationJob>,
  ): Promise<SubmissionEvaluationResult> {
    const jobData = job.data;
    const requestStartTime = Date.now();

    logger.info(
      {
        jobId: job.id,
        submissionId: jobData.submissionId,
        problemId: jobData.problemId,
        userId: jobData.userId,
      },
      "Evaluating Arena submission",
    );

    try {
      // 1. Evaluate
      const evaluation = await evaluator.evaluate({
        problemId: jobData.problemId,
        languageId: jobData.languageId,
        sourceCode: jobData.sourceCode,
        submissionId: jobData.submissionId,
      });

      const executionTime = Date.now() - requestStartTime;

      // 2. Update standard submission
      await submissionRepository.updateSubmissionStatus({
        id: jobData.submissionId,
        status: evaluation.status,
        details: {
          tests: evaluation.tests,
          evaluatedAt: new Date().toISOString(),
          evaluationDuration: executionTime,
        },
      });

      // 3. Match Logic
      if (jobData.arenaMatchId) {
        // A. Safety Double-Check: Skip if already officially submitted (Redis-First)
        const playerIdentifier = jobData.clerkId || jobData.userId;
        const match = await arenaMatchRepository.findById(jobData.arenaMatchId);
        let currentPlayer: any = null;

        if (match) {
          currentPlayer = match.players.find(
            (p) => p.userId === playerIdentifier,
          );
          if (currentPlayer && currentPlayer.verdict !== "NOT_SUBMITTED") {
            logger.warn(
              { submissionId: jobData.submissionId, userId: playerIdentifier },
              "Aborting evaluation: User already submitted for this match",
            );
            return {
              status: currentPlayer.verdict as any,
              tests: [],
              error: "Already submitted",
            };
          }
        }

        logger.debug(
          {
            submissionId: jobData.submissionId,
            arenaMatchId: jobData.arenaMatchId,
            status: evaluation.status,
          },
          "Arena submission evaluated",
        );
        const testsPassed = evaluation.tests.filter(
          (t: ExecutionTestResult) => t.status === "ACCEPTED",
        ).length;
        const totalTests = evaluation.tests.length;

        // B. Permanent Record (Log every attempt)
        await arenaSubmissionRepository.create({
          matchId: jobData.arenaMatchId,
          userId: jobData.clerkId || jobData.userId,
          submissionId: jobData.submissionId,
          status: evaluation.status,
          testsPassed,
          totalTests,
        });

        // C. Update MongoDB Match Document (Leaderboard)
        if (match) {
          const alreadySolved =
            currentPlayer && currentPlayer.verdict === "ACCEPTED";

          // Only update order if this is their first success
          let finalOrder = currentPlayer?.submissionOrder || 0;
          if (evaluation.status === "ACCEPTED" && !alreadySolved) {
            finalOrder = await arenaSubmissionRepository.getSubmissionOrder(
              jobData.arenaMatchId,
            );
          }

          const score = evaluation.status === "ACCEPTED" ? 100 : 0;
          await arenaMatchRepository.updatePlayerProgress(
            jobData.arenaMatchId,
            playerIdentifier,
            {
              status: evaluation.status,
              testsPassed,
              totalTests,
              score,
              lastSubmissionTime: new Date(),
              submissionOrder: finalOrder,
            },
          );

          // D. SYNC REDIS (For Go Hub)
          const room = await arenaRepository.getRoom(match.roomId);
          if (room && room.players[playerIdentifier]) {
            room.players[playerIdentifier].testsPassed = testsPassed;
            room.players[playerIdentifier].totalTests = totalTests;

            // HARD LOCK: status becomes SUBMITTED regardless of verdict (Accepted, Wrong Answer, etc.)
            room.players[playerIdentifier].status = "SUBMITTED";
            room.players[playerIdentifier].submissionOrder = finalOrder;

            // Simple scoring for now: 100 points for accepted
            if (evaluation.status === "ACCEPTED")
              room.players[playerIdentifier].score = 100;

            await arenaRepository.saveRoom(room);
            logger.info(
              { roomId: match.roomId, userId: playerIdentifier },
              "Synced Redis room state",
            );
          }

          // D. SIGNAL GO HUB (Leaderboard update)
          await arenaRedis.publishArenaUpdate(match.roomId, {
            type: "LEADERBOARD_UPDATE",
            roomId: match.roomId,
          });

          // E. Check for Match Completion (All players submitted)
          // Refetch to get the absolute latest status of all players
          const updatedMatch = await arenaMatchRepository.findById(
            jobData.arenaMatchId,
          );
          if (updatedMatch) {
            const playerStats = updatedMatch.players
              .map((p) => `${p.username}: ${p.verdict}`)
              .join(", ");
            const allFinished = updatedMatch.players.every(
              (p) => p.verdict !== "NOT_SUBMITTED",
            );

            logger.info(
              {
                arenaMatchId: jobData.arenaMatchId,
                allFinished,
                playerStats,
              },
              "Checking for match completion",
            );

            if (allFinished) {
              logger.info(
                { arenaMatchId: jobData.arenaMatchId, roomId: match.roomId },
                "Match complete! Finalizing results.",
              );

              // 1. Calculate Final Rankings (Score desc, then SubmissionOrder asc)
              const finalRankings = [...updatedMatch.players]
                .sort((a, b) => {
                  if (b.score !== a.score) return b.score - a.score;
                  // If scores tied, earlier submission wins. 0 means didn't finish.
                  if (a.submissionOrder === 0) return 1;
                  if (b.submissionOrder === 0) return -1;
                  return a.submissionOrder - b.submissionOrder;
                })
                .map((p, index) => ({ ...p, finalRank: index + 1 }));

              // 2. Finalize Match in MongoDB
              await arenaMatchRepository.updateStatus({
                id: jobData.arenaMatchId,
                status: "COMPLETED",
                endedAt: new Date(),
              });

              // 3. Transition Redis Room to FINISHED (Preserve data for a moment)
              await arenaRepository.finishRoom(match.roomId);

              // 4. Broadcast MATCH_OVER via Go Hub
              await arenaRedis.publishArenaUpdate(match.roomId, {
                type: "MATCH_OVER",
                roomId: match.roomId,
                payload: {
                  finalRankings,
                  matchId: jobData.arenaMatchId,
                },
              });

              // 5. Delayed Cleanup: Wipe Redis room after 1 minute to ensure zero "sticky" bugs
              setTimeout(async () => {
                logger.info(
                  { roomId: match.roomId },
                  "Performing delayed Redis room cleanup",
                );
                try {
                  await arenaRepository.deleteRoom(match.roomId);
                } catch (err) {
                  logger.error(
                    { roomId: match.roomId, err },
                    "Delayed cleanup failed",
                  );
                }
              }, 60 * 1000);
            }
          }
        }
      }

      return {
        ...evaluation,
        executionTime,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const attemptNumber = job.attemptsMade || 1;
      const maxAttempts = job.opts?.attempts || 3;

      logger.error(
        {
          jobId: job.id,
          submissionId: jobData.submissionId,
          error: errorMessage,
          attempt: attemptNumber,
        },
        "Submission evaluation failed",
      );

      // Handle final failure
      if (attemptNumber >= maxAttempts) {
        logger.error(
          {
            submissionId: jobData.submissionId,
            attempts: attemptNumber,
          },
          "Max retry attempts reached, marking as SYSTEM_ERROR",
        );

        try {
          await submissionRepository.updateSubmissionStatus({
            id: jobData.submissionId,
            status: "SYSTEM_ERROR",
            details: {
              error: errorMessage,
              failedAfterAttempts: attemptNumber,
              evaluatedAt: new Date().toISOString(),
            },
          });
        } catch (dbErr) {
          logger.error(
            {
              submissionId: jobData.submissionId,
              error: errorMessage,
              dbErr: dbErr instanceof Error ? dbErr.message : dbErr,
            },
            "Critical: Failed to update submission status to SYSTEM_ERROR in DB",
          );
        }
      }

      throw error; // Re-throw to trigger BullMQ retry
    }
  };
}
