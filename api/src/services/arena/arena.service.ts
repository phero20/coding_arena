import type { ArenaRepository } from "../../repositories/arena/arena.repository";
import type { UserRepository } from "../../repositories/user/user.repository";
import type { ArenaMatchRepository } from "../../repositories/arena/arena-match.repository";
import type { ArenaPlayerResult } from "../../repositories/arena/arena-match.repository";
import type { ArenaSubmissionRepository } from "../../repositories/arena/arena-submission.repository";
import {
  ArenaRoom,
  ArenaPlayer,
  ArenaRoomStatus,
} from "../../types/arena/arena.types";
import { type ICradle } from "../../libs/awilix-container";
import type { ArenaMatch } from "../../mongo/models/arena-match.model";
import { AppError } from "../../utils/app-error";
import { ERRORS } from "../../constants/errors";
import { redis, withLock } from "../../libs/core/redis";
import * as arenaRedis from "../../libs/core/arena-redis";
import { randomBytes } from "crypto";
import { createLogger } from "../../libs/utils/logger";
import { addMinutes } from "date-fns";
import { type IClockService } from "../common/clock.service";
import {
  CreateRoomSchema,
  UpdateRoomProblemSchema,
  StartMatchSchema,
  validateServiceInput,
} from "../validation/arena.validator";

const logger = createLogger("arena-service");

export interface MatchStartResult {
  matchId: string;
  roomId: string;
}

export class ArenaService {
  private readonly arenaRepository: ArenaRepository;
  private readonly userRepository: UserRepository;
  private readonly arenaMatchRepository: ArenaMatchRepository;
  private readonly arenaSubmissionRepository: ArenaSubmissionRepository;
  private readonly clock: IClockService;

  constructor({
    arenaRepository,
    userRepository,
    arenaMatchRepository,
    arenaSubmissionRepository,
    clockService,
  }: ICradle) {
    this.arenaRepository = arenaRepository;
    this.userRepository = userRepository;
    this.arenaMatchRepository = arenaMatchRepository;
    this.arenaSubmissionRepository = arenaSubmissionRepository;
    this.clock = clockService;
  }

  async createRoom(
    clerkUserId: string,
    details: {
      problemId?: string;
      problemSlug?: string;
      difficulty?: string;
      language?: string;
    },
  ): Promise<ArenaRoom> {
    validateServiceInput(CreateRoomSchema, { clerkUserId, details });

    const user = await this.userRepository.findByClerkId(clerkUserId);
    if (!user) throw AppError.from(ERRORS.AUTH.USER_NOT_FOUND);

    const roomId = randomBytes(3).toString("hex").toUpperCase();

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
      joinedAt: this.clock.nowDate(),
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
      createdAt: this.clock.nowDate(),
    };

    await this.arenaRepository.createRoom(room);
    return room;
  }

  private async ensureIsHost(
    roomId: string,
    clerkUserId: string,
  ): Promise<ArenaRoom> {
    const room = await this.arenaRepository.getRoom(roomId);
    if (!room) throw AppError.from(ERRORS.ARENA.ROOM_NOT_FOUND);

    if (room.players[clerkUserId]?.isCreator === false) {
      throw AppError.from(ERRORS.ARENA.NOT_HOST);
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
    validateServiceInput(UpdateRoomProblemSchema, {
      clerkUserId,
      roomId,
      details,
    });

    const room = await this.ensureIsHost(roomId, clerkUserId);

    const formattedTopic = details.problemSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    await this.arenaRepository.updateRoomStatus(roomId, {
      problemId: details.problemId,
      problemSlug: details.problemSlug,
      difficulty: details.difficulty,
      language: details.language,
      topic: formattedTopic,
    });
    await arenaRedis.publishArenaUpdate(roomId, {
      type: "PROBLEM_CHANGED",
      payload: room,
    });

    return room;
  }

  async startMatch(
    clerkUserId: string,
    roomId: string,
    traceId?: string,
  ): Promise<MatchStartResult> {
    validateServiceInput(StartMatchSchema, { clerkUserId, roomId });

    const room = await this.ensureIsHost(roomId, clerkUserId);

    if (!room.problemId) throw AppError.from(ERRORS.ARENA.NO_PROBLEM);

    return await withLock(`startMatch:${roomId}`, 5000, async () => {
      const options = { traceId };
      // Check if match already exists to prevent duplicate key errors (concurrency/double-clicks)
      const existingMatch = await this.arenaMatchRepository.findByRoomId(
        roomId,
        options,
      );
      if (
        existingMatch &&
        (existingMatch.status === "WAITING" ||
          existingMatch.status === "PLAYING")
      ) {
        return { matchId: existingMatch.id, roomId };
      }

      // 1. Create permanent Match record in Mongo with all players
      const players: ArenaPlayerResult[] = Object.values(room.players).map(
        (p) => ({
          userId: p.userId || "",
          username: p.username || "",
          avatarUrl: p.avatarUrl || "",
          submissionOrder: 0,
          verdict: "NOT_SUBMITTED",
          score: 0,
          testsPassed: 0,
          totalTests: 0,
        }),
      );

      const match = await this.arenaMatchRepository.create(
        {
          roomId: room.roomId,
          hostId: clerkUserId,
          problemId: room.problemId!,
          language: room.language || "javascript",
          players,
        },
        options,
      );

      // 2. Prepare room for new match (Reset player states from previous match results)
      for (const userId of Object.keys(room.players)) {
        room.players[userId].status = "CODING";
        room.players[userId].score = 0;
        room.players[userId].testsPassed = 0;
        room.players[userId].totalTests = 0;
      }

      // 3. Calculate Timers & Reset players
      const now = this.clock.now();
      const durationMins = room.matchDuration || 20;

      room.status = "PLAYING";
      room.startTime = now;
      room.endTime = addMinutes(now, durationMins).getTime();

      // We use a manual saveRoom here because we are resetting the ENTIRE player list
      // and initializing timers simultaneously within the distributed lock.
      await this.arenaRepository.saveRoom(room);

      // 4. Update MongoDB status
      await this.arenaMatchRepository.updateStatus(
        {
          id: match.id,
          status: "PLAYING",
          startedAt: this.clock.nowDate(),
        },
        options,
      );

      // 5. Broadcast via Go Hub
      await arenaRedis.publishMatchStarted(
        roomId,
        Object.keys(room.players),
        match.id,
        room.startTime,
        room.endTime,
      );

      return { matchId: match.id, roomId };
    });
  }

  async getMatchStatus(matchId: string): Promise<ArenaMatch> {
    const match =
      await this.arenaMatchRepository.findByIdWithSubmissions(matchId);
    if (!match) throw AppError.from(ERRORS.ARENA.MATCH_NOT_FOUND);
    return match;
  }

  async getRoom(roomId: string): Promise<ArenaRoom> {
    const room = await this.arenaRepository.getRoom(roomId);

    // Fallback: If Redis room is missing, check if a Match exists in MongoDB
    // This prevents 404s when a user refreshes exactly after a match ends
    if (!room) {
      const lastMatch = await this.arenaMatchRepository.findByRoomId(roomId);
      if (lastMatch) {
        // Return a "Pseudo-Room" that tells the frontend the match is finished
        return {
          roomId,
          status: "FINISHED",
          matchId: lastMatch.id,
          players: {},
          topic: "Match Results",
          createdAt: (lastMatch as any).createdAt || this.clock.nowDate(),
        };
      }
      throw AppError.notFound("Arena room not found");
    }

    // 🛡️ RECONCILIATION: Sync-on-Read Fallback
    // If Redis says 'PLAYING', we perform a lightweight check against MongoDB to ensure they agree.
    // This self-heals "Silent Killers" like failed Redis updates during match completion.
    if (room.status === "PLAYING") {
      const dbMatch = await this.arenaMatchRepository.findByRoomId(roomId);

      // If DB says COMPLETED but Redis said PLAYING, we perform immediate reconciliation.
      if (dbMatch && dbMatch.status === "COMPLETED") {
        logger.warn(
          { roomId, matchId: dbMatch.id },
          "[Reconciliation] Sync-on-Read triggered. Match completed in DB but PLAYING in Redis. Fixing.",
        );

        // Update Redis state to match MongoDB
        await this.arenaRepository.finishRoom(roomId);

        // Mutate local object to return the reconciled state
        room.status = "FINISHED";
        room.matchId = dbMatch.id;
        return room;
      }

      // Late Joiner / Refresh: Ensure matchId is present in Redis room for ongoing matches
      if (dbMatch) {
        room.matchId = dbMatch.id;
      }
    }

    // Standard late-join matchId attachment for FINISHED rooms
    if (room.status === "FINISHED") {
      const activeMatch = await this.arenaMatchRepository.findByRoomId(roomId);
      if (activeMatch) {
        room.matchId = activeMatch.id;
      }
    }

    return room;
  }
}
