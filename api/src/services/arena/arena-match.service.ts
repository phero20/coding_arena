import { MatchDomainEngine } from "./match-domain-engine.service";
import { MatchBroadcasterService } from "./match-broadcaster.service";
import type { EvaluationResultData } from "../../types/submissions/submission.types";
import { type ICradle } from "../../libs/awilix-container";
import type { ArenaRepository } from "../../repositories/arena/arena.repository";
import type { ArenaMatchRepository } from "../../repositories/arena/arena-match.repository";
import type { ArenaSubmissionRepository } from "../../repositories/arena/arena-submission.repository";
import { withLock } from "../../libs/core/redis";
import { withTransaction } from "../../mongo/transaction";
import { arenaCleanupQueue } from "../../libs/core/queue";
import { createLogger } from "../../libs/utils/logger";
import { ClientSession } from "mongoose";

const logger = createLogger("arena-match-service");

export interface MatchSubmissionData {
  submissionId: string;
  matchId: string;
  userId: string;
  clerkId?: string;
  evaluation: EvaluationResultData;
  traceId?: string;
}

import type { IClockService } from "../common/clock.service";

export class ArenaMatchService {
  private readonly arenaMatchRepository: ArenaMatchRepository;
  private readonly arenaSubmissionRepository: ArenaSubmissionRepository;
  private readonly arenaRepository: ArenaRepository;
  private readonly matchDomainEngine: MatchDomainEngine;
  private readonly matchBroadcaster: MatchBroadcasterService;
  private readonly clock: IClockService;

  constructor({
    arenaMatchRepository,
    arenaSubmissionRepository,
    arenaRepository,
    matchDomainEngine,
    matchBroadcaster,
    clockService,
  }: ICradle) {
    this.arenaMatchRepository = arenaMatchRepository;
    this.arenaSubmissionRepository = arenaSubmissionRepository;
    this.arenaRepository = arenaRepository;
    this.matchDomainEngine = matchDomainEngine;
    this.matchBroadcaster = matchBroadcaster;
    this.clock = clockService;
  }

  async handleMatchSubmission(data: MatchSubmissionData) {
    const { matchId, evaluation, submissionId } = data;
    const playerIdentifier = data.clerkId || data.userId;
    // Parallel Lock: Lock only the specific player within this match
    const lockKey = `match:${matchId}:player:${playerIdentifier}`;

    return await withLock(lockKey, 10000, async () => {
      return await withTransaction(async (session) => {
        const options = { session, traceId: data.traceId };
        const match = await this.arenaMatchRepository.findById(
          matchId,
          options,
        );
        if (!match) {
          throw new Error("Match not found");
        }

        const currentPlayer = match.players.find(
          (p) => p.userId === playerIdentifier,
        );

        if (!currentPlayer) {
          throw new Error("Player not found in match");
        }

        const testsPassed =
          evaluation.testsPassed ||
          evaluation.tests?.filter((t) => t.status === "ACCEPTED").length ||
          0;
        const totalTests =
          evaluation.totalTests || evaluation.tests?.length || 0;

        // 2. Create Match-specific Submission record within transaction
        const submission = await this.arenaSubmissionRepository.create(
          {
            matchId,
            userId: playerIdentifier,
            submissionId,
            status: evaluation.status as any,
            testsPassed,
            totalTests,
          },
          session,
        );

        // 3. Update Match Progress within transaction
        const score = this.matchDomainEngine.calculateScore(
          evaluation.status || "",
          currentPlayer.score,
        );
        const finalOrder = this.matchDomainEngine.determineSubmissionOrder(
          currentPlayer.submissionOrder || 0,
          match.players,
        );

        let timeTaken = 0;
        if (match.startedAt) {
          const now = this.clock.nowDate();
          timeTaken = this.matchDomainEngine.calculateTimeTaken(
            match.startedAt,
            now,
          );
        }

        await this.arenaMatchRepository.updatePlayerProgress(
          matchId,
          playerIdentifier,
          {
            status: evaluation.status || "PENDING",
            testsPassed,
            totalTests,
            score,
            lastSubmissionTime: this.clock.nowDate(),
            submissionOrder: finalOrder,
            timeTaken,
          },
          options,
        );

        // 4. Sync Redis State (Only if DB transaction succeeds)
        await this.arenaRepository.updateRoomPlayer(
          match.roomId,
          playerIdentifier,
          {
            testsPassed,
            totalTests,
            status: "SUBMITTED",
            submissionOrder: finalOrder,
            score,
            timeTaken,
          },
        );

        // Notify via Broadcaster
        await this.matchBroadcaster.notifyLeaderboardUpdate(match.roomId);

        // 6. Check for Match Completion (Optimized & Parallel-Safe)
        // No more serial 'sync' lock. We use a minimal projection-based check.
        // We catch errors to ensure rank/progress updates always persist.
        try {
          const unfinishedCount =
            await this.arenaMatchRepository.countUnfinishedPlayers(
              matchId,
              options,
            );
          if (unfinishedCount === 0) {
            logger.info(
              { matchId, roomId: match.roomId },
              "Match fully completed. Triggering finalization.",
            );
            // Pass the current match object to minimize DB hits (Mongoose Tax)
            await this.finalizeMatch(
              match.roomId,
              match,
              data.traceId,
              session,
            );
          }
        } catch (syncErr) {
          logger.warn(
            { matchId, syncErr },
            "Match completion check failed. Enforcer will handle it.",
          );
        }

        return submission;
      });
    });
  }

  /**
   * Calculates final results, updates statuses, and broadcasts MATCH_OVER.
   * Guarded by a distributed lock to prevent double-finalization.
   */
  async finalizeMatch(
    roomId: string,
    match: any,
    traceId?: string,
    session?: ClientSession,
  ): Promise<void> {
    const lockKey = `finishMatch:${roomId}`;

    // The distributed lock prevents multiple concurrent attempts for the SAME ROOM.
    await withLock(lockKey, 10000, async () => {
      try {
        await this.internalFinalizeMatch(roomId, match, traceId, session);
      } catch (err) {
        logger.error(
          { roomId, err },
          "Critical error during match finalization.",
        );
      }
    });
  }

  /**
   * Internal logic for match finalization.
   * DOES NOT handle locking - must be called from a locked context.
   */
  private async internalFinalizeMatch(
    roomId: string,
    match: any,
    traceId?: string,
    session?: ClientSession,
  ): Promise<void> {
    const options = { session, traceId };

    // 1. Atomic Check: verify status hasn't changed at the DB level
    // We use the new atomic status transition to "COMPLETED".
    // If this returns null, it means another thread already finalized it.
    const finalizedMatch =
      await this.arenaMatchRepository.atomicMarkStatusCompleted(
        match.id || match._id,
        options,
      );

    if (!finalizedMatch) {
      logger.info(
        { roomId },
        "Match already finalized in DB. Skipping duplicate logic.",
      );
      return;
    }

    // 2. Calculate Final Rankings using the most up-to-date player data
    // We use the finalizedMatch returned from the atomic update.
    const finalRankings = this.matchDomainEngine.rankPlayers(
      finalizedMatch.players,
    );

    // 3. Transition Redis Room to FINISHED (Atomic)
    await this.arenaRepository.finishRoom(roomId);

    // 4. Broadcast to all clients via Broadcaster
    await this.matchBroadcaster.broadcastMatchOver(
      roomId,
      finalizedMatch.id,
      finalRankings,
    );

    // 5. Persistent Cleanup (No leaks, surviving restarts)
    try {
      await arenaCleanupQueue.add(
        "delete-room",
        { roomId },
        { delay: 60 * 1000 },
      );
      logger.info({ roomId }, "Environment cleanup scheduled successfully.");
    } catch (err) {
      logger.error(
        { roomId, err },
        "Failed to schedule room cleanup. Manual purging may be required.",
      );
    }
  }

  /**
   * Forcibly kills an active match (e.g. on timeout).
   */
  async forceFinishMatch(roomId: string): Promise<void> {
    const lockKey = `finishMatch:${roomId}`;

    await withLock(lockKey, 5000, async () => {
      try {
        const room = await this.arenaRepository.getRoom(roomId);
        if (!room || room.status !== "PLAYING") return;

        const updatedMatch =
          await this.arenaMatchRepository.findByRoomId(roomId);
        if (!updatedMatch || updatedMatch.status !== "PLAYING") return;

        logger.info({ roomId }, "Force-killing match via enforcer.");
        await this.internalFinalizeMatch(roomId, updatedMatch);
      } catch (err) {
        logger.error({ roomId, err }, "Error force-finishing match.");
      }
    });
  }
}
