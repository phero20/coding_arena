import type { ArenaRepository } from "../repositories/arena.repository";
import type { UserRepository } from "../repositories/user.repository";
import type { ArenaMatchRepository } from "../repositories/arena-match.repository";
import type { ArenaPlayerResult } from "../repositories/arena-match.repository";
import type { ArenaSubmissionRepository } from "../repositories/arena-submission.repository";
import {
  ArenaRoom,
  ArenaPlayer,
  ArenaRoomStatus
} from "../types/arena.types";
import type { ArenaMatch } from "../mongo/models/arena-match.model";
import { AppError } from "../utils/app-error";
import { redis, acquireLock, releaseLock } from "../libs/redis";
import * as arenaRedis from "../libs/arena-redis";
import { randomBytes } from "crypto";

export interface MatchStartResult {
  matchId: string;
  roomId: string;
}

export class ArenaService {
  constructor(
    private readonly arenaRepository: ArenaRepository,
    private readonly userRepository: UserRepository,
    private readonly arenaMatchRepository: ArenaMatchRepository,
    private readonly arenaSubmissionRepository: ArenaSubmissionRepository,
  ) {}

  async createRoom(
    clerkUserId: string,
    details: {
      problemId?: string;
      problemSlug?: string;
      difficulty?: string;
      language?: string;
    },
  ): Promise<ArenaRoom> {
    const user = await this.userRepository.findByClerkId(clerkUserId);
    if (!user) throw AppError.notFound("User not found");

    const roomId = randomBytes(3).toString('hex').toUpperCase();

    const creator: ArenaPlayer = {
      userId: clerkUserId,
      username: user.username,
      avatarUrl: user.avatarUrl || "",
      isCreator: true,
      score: 0,
      testsPassed: 0,
      totalTests: 0,
      status: "CODING",
      isOffline: false,
      joinedAt: new Date(),
    };

    // Format a nice topic if slug is available
    const formattedTopic = details.problemSlug
      ? details.problemSlug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "Custom Battle";

    const room: ArenaRoom = {
      roomId,
      status: "WAITING",
      topic: formattedTopic,
      problemId: details.problemId,
      problemSlug: details.problemSlug,
      difficulty: details.difficulty,
      language: details.language,
      players: { [clerkUserId]: creator },
      createdAt: new Date(),
    };

    await this.arenaRepository.createRoom(room);
    return room;
  }

  private async ensureIsHost(roomId: string, clerkUserId: string): Promise<ArenaRoom> {
    const room = await this.arenaRepository.getRoom(roomId);
    if (!room) throw AppError.notFound("Arena room not found");

    if (room.players[clerkUserId]?.isCreator === false) {
      throw AppError.forbidden("Only the host can perform this action");
    }

    return room;
  }

  async updateRoomProblem(
    clerkUserId: string,
    roomId: string,
    details: {
      problemId: string;
      problemSlug: string;
      difficulty?: string;
      language?: string;
    },
  ): Promise<ArenaRoom> {
    const room = await this.ensureIsHost(roomId, clerkUserId);

    const formattedTopic = details.problemSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    room.problemId = details.problemId;
    room.problemSlug = details.problemSlug;
    room.difficulty = details.difficulty;
    room.language = details.language;
    room.topic = formattedTopic;

    await this.arenaRepository.saveRoom(room);
    await arenaRedis.publishArenaUpdate(roomId, { type: "PROBLEM_CHANGED", payload: room });

    return room;
  }

  async startMatch(clerkUserId: string, roomId: string): Promise<MatchStartResult> {
    const room = await this.ensureIsHost(roomId, clerkUserId);

    if (!room.problemId) throw AppError.badRequest("No problem selected for this room");

    // Acquire distributed lock to prevent concurrent setup flows
    const lockId = await acquireLock(`startMatch:${roomId}`, 5000);
    if (!lockId) {
      // If lock is held, it might be because a match already started or is starting
      const existingMatch = await this.arenaMatchRepository.findByRoomId(roomId);
      if (existingMatch && (existingMatch.status === "WAITING" || existingMatch.status === "PLAYING")) {
        return { matchId: existingMatch.id, roomId };
      }
      throw AppError.conflict("Match setup already in progress");
    }

    try {
      // Check if match already exists to prevent duplicate key errors (concurrency/double-clicks)
      const existingMatch = await this.arenaMatchRepository.findByRoomId(roomId);
      if (existingMatch && (existingMatch.status === "WAITING" || existingMatch.status === "PLAYING")) {
        return { matchId: existingMatch.id, roomId };
      }

      // 1. Create permanent Match record in Mongo with all players
      const players: ArenaPlayerResult[] = Object.values(room.players).map(p => ({
        userId: p.userId,
        username: p.username,
        avatarUrl: p.avatarUrl,
        submissionOrder: 0,
        verdict: "NOT_SUBMITTED",
        score: 0,
        testsPassed: 0,
        totalTests: 0,
      }));

      const match = await this.arenaMatchRepository.create({
        roomId: room.roomId,
        hostId: clerkUserId,
        problemId: room.problemId,
        language: room.language || "javascript",
        players,
      });

      // 2. Prepare room for new match (Reset player states from previous match results)
      for (const userId of Object.keys(room.players)) {
        room.players[userId].status = "CODING";
        room.players[userId].score = 0;
        room.players[userId].testsPassed = 0;
        room.players[userId].totalTests = 0;
      }

      // 3. Calculate Timers & Update Redis status
      const now = Date.now();
      room.status = "PLAYING";
      room.startTime = now;
      const durationMins = room.matchDuration || 20;
      room.endTime = now + (durationMins * 60 * 1000);
      
      await this.arenaRepository.saveRoom(room);

      // 4. Update MongoDB status
      await this.arenaMatchRepository.updateStatus({
        id: match.id,
        status: "PLAYING",
        startedAt: new Date(),
      });

      // 5. Broadcast via Go Hub
      await arenaRedis.publishMatchStarted(roomId, Object.keys(room.players), match.id);

      return { matchId: match.id, roomId };
    } finally {
      await releaseLock(`startMatch:${roomId}`, lockId);
    }
  }

  async getMatchStatus(matchId: string): Promise<ArenaMatch> {
    const match = await this.arenaMatchRepository.findByIdWithSubmissions(matchId);
    if (!match) throw AppError.notFound("Match not found");
    return match;
  }

  async getRoom(roomId: string): Promise<ArenaRoom> {
    const room = await this.arenaRepository.getRoom(roomId);
    if (!room) throw AppError.notFound("Arena room not found");

    // If match is in progress, find and attach the matchId for late joiners
    // Attach matchId for active or recently finished matches
    // This perfectly solves the "Results Not Available" error during page reloads.
    if (room.status === "PLAYING" || room.status === "FINISHED") {
      const activeMatch = await this.arenaMatchRepository.findByRoomId(roomId);
      if (activeMatch) {
        room.matchId = activeMatch.id;
      }
    }

    return room;
  }

  /**
   * Hard-kills an active match, finalizes scores, and broadcasts MATCH_OVER.
   * Called automatically by the Enforcer Worker when the match timer expires.
   */
  async forceFinishMatch(roomId: string): Promise<void> {
    const lockId = await acquireLock(`finishMatch:${roomId}`, 5000);
    if (!lockId) return; // Prevent concurrent finishing

    try {
      const room = await this.arenaRepository.getRoom(roomId);
      if (!room || room.status !== "PLAYING") return;

      const updatedMatch = await this.arenaMatchRepository.findByRoomId(roomId);
      if (!updatedMatch || updatedMatch.status !== "PLAYING") return;

      console.log(`[ArenaService] Hard-killing expired match for room ${roomId}`);

      // 1. Calculate Final Rankings
      const finalRankings = [...updatedMatch.players]
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (a.submissionOrder === 0) return 1;
          if (b.submissionOrder === 0) return -1;
          return a.submissionOrder - b.submissionOrder;
        })
        .map((p, index) => ({ ...p, finalRank: index + 1 }));

      // 2. Finalize Match in MongoDB
      await this.arenaMatchRepository.updateStatus({
        id: updatedMatch.id,
        status: "COMPLETED",
        endedAt: new Date(),
      });

      // 3. Transition Redis Room to FINISHED
      await this.arenaRepository.finishRoom(roomId);

      // 4. Broadcast MATCH_OVER via Go Hub
      await arenaRedis.publishArenaUpdate(roomId, {
        type: "MATCH_OVER",
        roomId: roomId,
        payload: {
          finalRankings,
          matchId: updatedMatch.id,
        },
      });

      // 5. Delayed Cleanup
      setTimeout(async () => {
        try {
          await this.arenaRepository.deleteRoom(roomId);
        } catch (err) {
          console.error("Delayed cleanup failed", err);
        }
      }, 60 * 1000);
      
    } catch (e) {
      console.error(`[ArenaService] Error force finishing match ${roomId}:`, e);
    } finally {
      await releaseLock(`finishMatch:${roomId}`, lockId);
    }
  }
}

