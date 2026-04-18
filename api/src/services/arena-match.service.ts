import type { ArenaRepository } from "../repositories/arena.repository";
import type { ArenaMatchRepository } from "../repositories/arena-match.repository";
import type { ArenaSubmissionRepository } from "../repositories/arena-submission.repository";
import { acquireLock, releaseLock } from "../libs/redis";
import * as arenaRedis from "../libs/arena-redis";
import { arenaCleanupQueue } from "../libs/queue";
import { createLogger } from "../libs/logger";

const logger = createLogger("arena-match-service");

export interface MatchSubmissionData {
  submissionId: string;
  matchId: string;
  userId: string;
  clerkId?: string;
  evaluation: {
    status: string;
    tests: any[];
  };
}

export class ArenaMatchService {
  constructor(
    private readonly arenaMatchRepository: ArenaMatchRepository,
    private readonly arenaSubmissionRepository: ArenaSubmissionRepository,
    private readonly arenaRepository: ArenaRepository,
  ) {}

  /**
   * Handles the side effects of an arena submission, including:
   * 1. Updating the leaderboard in MongoDB.
   * 2. Synchronizing the status in Redis (Go Hub source of truth) ATOMICALLY.
   * 3. Checking for match completion.
   */
  async handleMatchSubmission(data: MatchSubmissionData): Promise<void> {
    const { matchId, userId, clerkId, evaluation } = data;
    const playerIdentifier = clerkId || userId;

    // 1. Acquire Distributed Lock (industry-standard for shared state)
    // Prevents "last-write-wins" race conditions during simultaneous finishes.
    // Added 3 retries (50ms apart) to handle high-concurrency spikes gracefully.
    const lockKey = `matchSync:${matchId}`;
    const lockId = await acquireLock(lockKey, 5000, 3, 50); 
    if (!lockId) {
      logger.warn({ matchId, userId: playerIdentifier }, "Failed to acquire lock for match sync after retries.");
      throw new Error("Match sync lock conflict. System under high load.");
    }

    try {
      const match = await this.arenaMatchRepository.findById(matchId);
      if (!match) {
        logger.error({ matchId }, "Match not found during submission handling");
        return;
      }

      // A. Safety Check
      const currentPlayer = match.players.find((p) => p.userId === playerIdentifier);
      if (currentPlayer && currentPlayer.verdict !== "NOT_SUBMITTED") {
        logger.warn({ matchId, userId: playerIdentifier }, "User already submitted. Skipping sync.");
        return;
      }

      const testsPassed = evaluation.tests.filter((t: any) => t.status === "ACCEPTED").length;
      const totalTests = evaluation.tests.length;

      // 2. Permanent Attempt Record
      await this.arenaSubmissionRepository.create({
        matchId,
        userId: playerIdentifier,
        submissionId: data.submissionId,
        status: evaluation.status as any,
        testsPassed,
        totalTests,
      });

      // 3. Update Leaderboard in MongoDB
      const alreadySolved = currentPlayer && currentPlayer.verdict === "ACCEPTED";
      let finalOrder = currentPlayer?.submissionOrder || 0;
      if (evaluation.status === "ACCEPTED" && !alreadySolved) {
        finalOrder = await this.arenaSubmissionRepository.getSubmissionOrder(matchId);
      }

      let timeTaken: number | undefined;
      if (match.startedAt) {
        timeTaken = Date.now() - match.startedAt.getTime();
      }

      const score = evaluation.status === "ACCEPTED" ? 100 : 0;
      await this.arenaMatchRepository.updatePlayerProgress(matchId, playerIdentifier, {
        status: evaluation.status as any,
        testsPassed,
        totalTests,
        score,
        lastSubmissionTime: new Date(),
        submissionOrder: finalOrder,
        timeTaken,
      });

      // 4. Sync Redis State ATOMICALLY
      await this.arenaRepository.updateRoomPlayer(match.roomId, playerIdentifier, {
        testsPassed,
        totalTests,
        status: "SUBMITTED",
        submissionOrder: finalOrder,
        score: evaluation.status === "ACCEPTED" ? 100 : 0,
        timeTaken,
      });
        
      // Notify Go Hub
      await arenaRedis.publishArenaUpdate(match.roomId, {
        type: "LEADERBOARD_UPDATE",
        roomId: match.roomId,
      });

      // 5. Check for Match Completion
      const updatedMatch = await this.arenaMatchRepository.findById(matchId);
      if (updatedMatch) {
        const allFinished = updatedMatch.players.every((p) => p.verdict !== "NOT_SUBMITTED");
        if (allFinished) {
          logger.info({ matchId, roomId: match.roomId }, "Match fully completed.");
          await this.finalizeMatch(match.roomId, updatedMatch);
        }
      }
    } finally {
      // 6. Release Lock
      await releaseLock(lockKey, lockId);
    }
  }

  /**
   * Calculates final results, updates statuses, and broadcasts MATCH_OVER.
   * Guarded by a distributed lock to prevent double-finalization.
   */
  async finalizeMatch(roomId: string, match: any): Promise<void> {
    // 0. Distributed Lock to prevent double-finalization via multiple workers
    const lockId = await acquireLock(`finishMatch:${roomId}`, 10000, 2, 100);
    if (!lockId) {
      logger.warn({ roomId }, "Finalization already in progress by another worker.");
      return;
    }

    try {
      await this.internalFinalizeMatch(roomId, match);
    } catch (err) {
      logger.error({ roomId, err }, "Critical error during match finalization.");
    } finally {
      // 5. Release Lock
      await releaseLock(`finishMatch:${roomId}`, lockId);
    }
  }

  /**
   * Internal logic for match finalization.
   * DOES NOT handle locking - must be called from a locked context.
   */
  private async internalFinalizeMatch(roomId: string, match: any): Promise<void> {
    // 1. Atomic Check: verify status hasn't changed while waiting for lock
    const currentMatch = await this.arenaMatchRepository.findById(match.id);
    if (!currentMatch || currentMatch.status === "COMPLETED") {
      logger.info({ roomId }, "Match already finalized. Skipping duplicate logic.");
      return;
    }

    const finalRankings = [...match.players]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;

        // Speed tie-breaker for identical scores
        const aTime = a.timeTaken ?? Infinity;
        const bTime = b.timeTaken ?? Infinity;
        if (aTime !== bTime) return aTime - bTime;

        if (a.submissionOrder === 0) return 1;
        if (b.submissionOrder === 0) return -1;
        return a.submissionOrder - b.submissionOrder;
      })
      .map((p, index) => ({ ...p, finalRank: index + 1 }));

    // 2. Finalize Match in MongoDB
    await this.arenaMatchRepository.updateStatus({
      id: match.id,
      status: "COMPLETED",
      endedAt: new Date(),
    });

    // 3. Transition Redis Room to FINISHED (Atomic)
    await this.arenaRepository.finishRoom(roomId);

    // 4. Broadcast to all clients
    await arenaRedis.publishArenaUpdate(roomId, {
      type: "MATCH_OVER",
      roomId,
      payload: {
        finalRankings,
        matchId: match.id,
      },
    });

    // 5. Persistent Cleanup (No leaks, surviving restarts)
    try {
      await arenaCleanupQueue.add(
        "delete-room",
        { roomId },
        { delay: 60 * 1000 }
      );
      logger.info({ roomId }, "Environment cleanup scheduled successfully.");
    } catch (err) {
      logger.error(
        { roomId, err },
        "Failed to schedule room cleanup. Manual purging may be required."
      );
    }
  }

  /**
   * Forcibly kills an active match (e.g. on timeout).
   */
  async forceFinishMatch(roomId: string): Promise<void> {
    const lockId = await acquireLock(`finishMatch:${roomId}`, 5000);
    if (!lockId) return;

    try {
      const room = await this.arenaRepository.getRoom(roomId);
      if (!room || room.status !== "PLAYING") return;

      const updatedMatch = await this.arenaMatchRepository.findByRoomId(roomId);
      if (!updatedMatch || updatedMatch.status !== "PLAYING") return;

      logger.info({ roomId }, "Force-killing match via enforcer.");
      await this.internalFinalizeMatch(roomId, updatedMatch);
    } catch (err) {
      logger.error({ roomId, err }, "Error force-finishing match.");
    } finally {
      await releaseLock(`finishMatch:${roomId}`, lockId);
    }
  }
}
