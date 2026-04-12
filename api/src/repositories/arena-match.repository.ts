import { MongoBaseRepository } from "./base.repository";
import { 
  ArenaMatch, 
  ArenaMatchDocument, 
  ArenaMatchStatus, 
  ArenaPlayerResult,
  ArenaMatchModel 
} from "../mongo/models/arena-match.model";

export type { ArenaPlayerResult };

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
    const updateData: any = { status: input.status };
    if (input.startedAt) updateData.startedAt = input.startedAt;
    if (input.endedAt) updateData.endedAt = input.endedAt;

    const doc = await this.model.findByIdAndUpdate(input.id, updateData, {
      new: true,
    }).exec();

    return this.toDomain(doc);
  }

  async updatePlayerProgress(
    matchId: string, 
    userId: string, 
    progress: UpdatePlayerProgressInput['progress']
  ): Promise<ArenaMatch | null> {
    const updateQuery: any = {
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

    const doc = await this.model.findByIdAndUpdate(
      matchId,
      updateQuery,
      {
        arrayFilters: [{ "player.userId": userId }],
        new: true,
      }
    ).exec();

    return this.toDomain(doc);
  }

  async addPlayer(matchId: string, player: ArenaPlayerResult): Promise<ArenaMatch | null> {
    const doc = await this.model.findByIdAndUpdate(
      matchId,
      { $addToSet: { players: player } },
      { new: true }
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
  async findByIdWithSubmissions(id: string): Promise<any | null> {
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
          startedAt: { $first: "$startedAt" },
          endedAt: { $first: "$endedAt" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          players: { $push: "$players" },
        },
      },
    ]).exec();

    if (!results || results.length === 0) return null;

    const match = results[0];
    return {
      ...match,
      id: match._id.toString(),
    };
  }
}
