import { MongoBaseRepository } from "../base.repository";
import { type UpdateQuery } from "mongoose";
import {
  ArenaMatch,
  ArenaMatchDocument,
  ArenaMatchStatus,
  ArenaPlayerResult,
  ArenaMatchModel,
} from "../../mongo/models/arena-match.model";
import {
  zArenaMatchDetailed,
  type ArenaMatchDetailed,
} from "../../types/arena/arena-match.types";
import { type RepositoryOptions } from "../base.repository";

export type { ArenaPlayerResult };

/**
 * Zod Schemas for runtime validation of complex aggregation results.
 * Moved to @types/arena-match.types.ts
 */

export interface CreateArenaMatchInput {
  roomId: string;
  hostId: string;
  problemId: string;
  language: string;
  players: ArenaPlayerResult[];
}

export interface UpdateArenaMatchStatusInput {
  id: string;
  status: ArenaMatchStatus;
  startedAt?: Date;
  endedAt?: Date;
}

export interface UpdatePlayerProgressInput {
  matchId: string;
  userId: string;
  progress: {
    status: string;
    testsPassed: number;
    totalTests: number;
    score: number;
    lastSubmissionTime?: Date;
    submissionOrder?: number;
    timeTaken?: number;
  };
}

import { createLogger } from "../../libs/utils/logger";
import { type IClockService } from "../../services/common/clock.service";
import { type ICradle } from "../../libs/awilix-container";

export class ArenaMatchRepository extends MongoBaseRepository<
  ArenaMatch,
  ArenaMatchDocument
> {
  private readonly clock: IClockService;

  constructor({ clockService }: ICradle) {
    super(ArenaMatchModel);
    this.clock = clockService;
  }

  async create(
    input: CreateArenaMatchInput,
    options?: RepositoryOptions,
  ): Promise<ArenaMatch> {
    const [doc] = await this.model.create(
      [
        {
          roomId: input.roomId,
          hostId: input.hostId,
          problemId: input.problemId,
          language: input.language,
          status: "WAITING",
          players: input.players || [],
        },
      ],
      { session: options?.session },
    );

    return this.toDomain(doc)!;
  }

  async findByRoomId(
    roomId: string,
    options?: RepositoryOptions,
  ): Promise<ArenaMatch | null> {
    const query = this.model.findOne({ roomId }).sort({ createdAt: -1 }).lean();
    this.applyOptions(query, options);
    const doc = await query.exec();
    return this.toDomain(doc as any);
  }

  async updateStatus(
    input: UpdateArenaMatchStatusInput,
    options?: RepositoryOptions,
  ): Promise<ArenaMatch | null> {
    const updateData: UpdateQuery<ArenaMatchDocument> = {
      status: input.status,
    };
    if (input.startedAt) updateData.startedAt = input.startedAt;
    if (input.endedAt) updateData.endedAt = input.endedAt;

    const query = this.model
      .findByIdAndUpdate(input.id, updateData, {
        returnDocument: "after",
      })
      .lean();
    this.applyOptions(query, options);

    const doc = await query.exec();
    return this.toDomain(doc as any);
  }

  async updatePlayerProgress(
    matchId: string,
    userId: string,
    progress: UpdatePlayerProgressInput["progress"],
    options?: RepositoryOptions,
  ): Promise<ArenaMatch | null> {
    const updateQuery: UpdateQuery<ArenaMatchDocument> = {
      $set: {
        "players.$[player].verdict": progress.status,
        "players.$[player].testsPassed": progress.testsPassed,
        "players.$[player].totalTests": progress.totalTests,
        "players.$[player].score": progress.score,
      },
    };

    if (progress.lastSubmissionTime) {
      updateQuery.$set["players.$[player].lastSubmissionTime"] =
        progress.lastSubmissionTime;
    }

    if (progress.submissionOrder !== undefined) {
      updateQuery.$set["players.$[player].submissionOrder"] =
        progress.submissionOrder;
    }
    if (progress.score !== undefined) {
      updateQuery.$set["players.$[player].score"] = progress.score;
    }
    if (progress.timeTaken !== undefined) {
      updateQuery.$set["players.$[player].timeTaken"] = progress.timeTaken;
    }

    const query = this.model
      .findByIdAndUpdate(matchId, updateQuery, {
        arrayFilters: [{ "player.userId": userId }],
        returnDocument: "after",
      })
      .lean();
    this.applyOptions(query, options);

    const doc = await query.exec();
    return this.toDomain(doc as any);
  }

  async addPlayer(
    matchId: string,
    player: ArenaPlayerResult,
    options?: RepositoryOptions,
  ): Promise<ArenaMatch | null> {
    const query = this.model
      .findByIdAndUpdate(
        matchId,
        { $addToSet: { players: player } },
        { returnDocument: "after" },
      )
      .lean();
    this.applyOptions(query, options);

    const doc = await query.exec();
    return this.toDomain(doc as any);
  }

  async getHistoryByUserId(userId: string, limit = 10): Promise<ArenaMatch[]> {
    const docs = await this.model
      .find({ "players.userId": userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return this.toDomainArray(docs);
  }

  /**
   * Fetches the match results including the source code for each player.
   * Uses an aggregation pipeline to join ArenaMatch -> ArenaSubmission -> Submission.
   */
  async findByIdWithSubmissions(
    id: string,
  ): Promise<ArenaMatchDetailed | null> {
    const { mongoose } = await import("../../mongo/connection");

    const results = await this.model
      .aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        // 1. Flatten players to join each one individually
        { $unwind: { path: "$players", preserveNullAndEmptyArrays: true } },
        // 2. Look up the link record in ArenaSubmission
        {
          $lookup: {
            from: "arenasubmissions",
            let: { mId: { $toString: "$_id" }, uId: "$players.userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$matchId", "$$mId"] },
                      { $eq: ["$userId", "$$uId"] },
                    ],
                  },
                },
              },
            ],
            as: "arenaSub",
          },
        },
        { $unwind: { path: "$arenaSub", preserveNullAndEmptyArrays: true } },
        // 3. Look up the actual code from Submission
        {
          $lookup: {
            from: "submissions",
            let: { sId: "$arenaSub.submissionId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", { $toObjectId: "$$sId" }],
                  },
                },
              },
            ],
            as: "subDetails",
          },
        },
        { $unwind: { path: "$subDetails", preserveNullAndEmptyArrays: true } },
        // 4. Inject code results into the player object
        {
          $addFields: {
            "players.sourceCode": "$subDetails.sourceCode",
            "players.languageId": "$subDetails.languageId",
          },
        },
        // 5. Re-group players back into the original match structure
        {
          $group: {
            _id: "$_id",
            roomId: { $first: "$roomId" },
            hostId: { $first: "$hostId" },
            problemId: { $first: "$problemId" },
            language: { $first: "$language" },
            status: { $first: "$status" },
            expiresAt: { $first: "$expiresAt" },
            startedAt: { $first: "$startedAt" },
            endedAt: { $first: "$endedAt" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            players: { $push: "$players" },
          },
        },
      ])
      .exec();

    if (!results || results.length === 0) return null;

    // Use Zod to transform the 'any' aggregation result into a strictly typed detailed match object
    return zArenaMatchDetailed.parse(results[0]);
  }

  /**
   * Performance Optimized: Fetches only player IDs and verdicts.
   * Used for high-concurrency 'match finished' checks to avoid loading entire player objects.
   */
  async getPlayersStatuses(
    matchId: string,
    options?: RepositoryOptions,
  ): Promise<{ userId: string; verdict: string }[]> {
    const query = this.model
      .findById(matchId, { "players.userId": 1, "players.verdict": 1 })
      .lean();
    this.applyOptions(query, options);

    const doc = await query.exec();
    if (!doc || !doc.players) return [];

    return doc.players.map((p: any) => ({
      userId: p.userId,
      verdict: p.verdict,
    }));
  }

  /**
   * Performance Optimized: Counts players who haven't submitted yet.
   * Minimal database overhead for high-concurrency completion checks.
   */
  async countUnfinishedPlayers(
    matchId: string,
    options?: RepositoryOptions,
  ): Promise<number> {
    const query = this.model.aggregate([
      { $match: { _id: this.toObjectId(matchId) } },
      {
        $project: {
          unfinishedCount: {
            $size: {
              $filter: {
                input: "$players",
                as: "p",
                cond: { $eq: ["$$p.verdict", "NOT_SUBMITTED"] },
              },
            },
          },
        },
      },
    ]);
    if (options?.session) query.session(options.session);

    const result = await query.exec();
    return result[0]?.unfinishedCount ?? 0;
  }

  /**
   * Atomic Status Guard: Attempts to mark a match as COMPLETED only if it's currently PLAYING.
   * This is the "Optimistic Concurrency" check that prevents multiple race-condition finalizations.
   * Returns the updated match document if successful, null otherwise.
   */
  async atomicMarkStatusCompleted(
    matchId: string,
    options?: RepositoryOptions,
  ): Promise<ArenaMatch | null> {
    const query = this.model
      .findOneAndUpdate(
        { _id: this.toObjectId(matchId), status: "PLAYING" },
        { $set: { status: "COMPLETED", endedAt: this.clock.nowDate() } },
        { returnDocument: "after" },
      )
      .lean();
    this.applyOptions(query, options);

    const doc = await query.exec();
    return this.toDomain(doc as any);
  }
}
