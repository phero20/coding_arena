import { MongoBaseRepository } from "./base.repository";
import { type UpdateQuery } from "mongoose";
import { 
  ArenaMatch, 
  ArenaMatchDocument, 
  ArenaMatchStatus, 
  ArenaPlayerResult,
  ArenaMatchModel,
} from "../mongo/models/arena-match.model";
import { zArenaMatchDetailed, type ArenaMatchDetailed } from "../types/arena-match.types";

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

export class ArenaMatchRepository extends MongoBaseRepository<ArenaMatch, ArenaMatchDocument> {
  constructor() {
    super(ArenaMatchModel);
  }

  async create(input: CreateArenaMatchInput): Promise<ArenaMatch> {
    const doc = await this.model.create({
      roomId: input.roomId,
      hostId: input.hostId,
      problemId: input.problemId,
      language: input.language,
      status: "WAITING",
      players: input.players || [],
    });


    return this.toDomain(doc)!;
  }

  async findByRoomId(roomId: string): Promise<ArenaMatch | null> {
    const doc = await this.model.findOne({ roomId }).sort({ createdAt: -1 }).exec();
    return this.toDomain(doc);
  }

  async updateStatus(input: UpdateArenaMatchStatusInput): Promise<ArenaMatch | null> {
    const updateData: UpdateQuery<ArenaMatchDocument> = { status: input.status };
    if (input.startedAt) updateData.startedAt = input.startedAt;
    if (input.endedAt) updateData.endedAt = input.endedAt;

    const doc = await this.model.findByIdAndUpdate(input.id, updateData, {
      returnDocument: "after",
    }).exec();

    return this.toDomain(doc);
  }

  async updatePlayerProgress(
    matchId: string, 
    userId: string, 
    progress: UpdatePlayerProgressInput['progress']
  ): Promise<ArenaMatch | null> {
    const updateQuery: UpdateQuery<ArenaMatchDocument> = {
      $set: {
        "players.$[player].verdict": progress.status,
        "players.$[player].testsPassed": progress.testsPassed,
        "players.$[player].totalTests": progress.totalTests,
        "players.$[player].score": progress.score,
      }
    };


    if (progress.lastSubmissionTime) {
      updateQuery.$set["players.$[player].lastSubmissionTime"] = progress.lastSubmissionTime;
    }

    if (progress.submissionOrder !== undefined) {
      updateQuery.$set["players.$[player].submissionOrder"] = progress.submissionOrder;
    }
    if (progress.score !== undefined) {
      updateQuery.$set["players.$[player].score"] = progress.score;
    }
    if (progress.timeTaken !== undefined) {
      updateQuery.$set["players.$[player].timeTaken"] = progress.timeTaken;
    }

    const doc = await this.model.findByIdAndUpdate(
      matchId,
      updateQuery,
      {
        arrayFilters: [{ "player.userId": userId }],
        returnDocument: "after",
      }
    ).exec();

    return this.toDomain(doc);
  }

  async addPlayer(matchId: string, player: ArenaPlayerResult): Promise<ArenaMatch | null> {
    const doc = await this.model.findByIdAndUpdate(
      matchId,
      { $addToSet: { players: player } },
      { returnDocument: "after" }
    ).exec();
    return this.toDomain(doc);
  }

  async getHistoryByUserId(userId: string, limit = 10): Promise<ArenaMatch[]> {
    const docs = await this.model.find({ "players.userId": userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return this.toDomainArray(docs);
  }

  /**
   * Fetches the match results including the source code for each player.
   * Uses an aggregation pipeline to join ArenaMatch -> ArenaSubmission -> Submission.
   */
  async findByIdWithSubmissions(id: string): Promise<ArenaMatchDetailed | null> {
    const { mongoose } = await import("../mongo/connection");

    const results = await this.model.aggregate([
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
    ]).exec();

    if (!results || results.length === 0) return null;

    // Use Zod to transform the 'any' aggregation result into a strictly typed detailed match object
    return zArenaMatchDetailed.parse(results[0]);
  }
}
