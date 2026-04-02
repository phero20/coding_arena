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

export class ArenaMatchRepository {
  private toMatch(doc: ArenaMatchDocument | null): ArenaMatch | null {
    if (!doc) return null;
    const obj = doc.toObject();
    return {
      ...obj,
      id: doc._id.toString(),
    } as ArenaMatch;
  }


  async create(input: CreateArenaMatchInput): Promise<ArenaMatch> {
    const doc = await ArenaMatchModel.create({
      roomId: input.roomId,
      hostId: input.hostId,
      problemId: input.problemId,
      language: input.language,
      status: "WAITING",
      players: input.players || [],
    });


    return this.toMatch(doc)!;
  }

  async findByRoomId(roomId: string): Promise<ArenaMatch | null> {
    const doc = await ArenaMatchModel.findOne({ roomId }).exec();
    return this.toMatch(doc);
  }

  async findById(id: string): Promise<ArenaMatch | null> {
    const doc = await ArenaMatchModel.findById(id).exec();
    return this.toMatch(doc);
  }

  async updateStatus(input: UpdateArenaMatchStatusInput): Promise<ArenaMatch | null> {
    const updateData: any = { status: input.status };
    if (input.startedAt) updateData.startedAt = input.startedAt;
    if (input.endedAt) updateData.endedAt = input.endedAt;

    const doc = await ArenaMatchModel.findByIdAndUpdate(input.id, updateData, {
      new: true,
    }).exec();

    return this.toMatch(doc);
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

    const doc = await ArenaMatchModel.findByIdAndUpdate(
      matchId,
      updateQuery,
      {
        arrayFilters: [{ "player.userId": userId }],
        new: true,
      }
    ).exec();

    return this.toMatch(doc);
  }

  async addPlayer(matchId: string, player: ArenaPlayerResult): Promise<ArenaMatch | null> {
    const doc = await ArenaMatchModel.findByIdAndUpdate(
      matchId,
      { $addToSet: { players: player } },
      { new: true }
    ).exec();
    return this.toMatch(doc);
  }

  async getHistoryByUserId(userId: string, limit = 10): Promise<ArenaMatch[]> {
    const docs = await ArenaMatchModel.find({ "players.userId": userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return docs.map((doc) => this.toMatch(doc)).filter((m): m is ArenaMatch => m !== null);
  }
}
