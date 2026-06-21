import { ArenaMatchModel } from "../../mongo/models/arena-match.model";
import { ArenaSubmissionModel } from "../../mongo/models/arena-submission.model";

export interface IArenaAdminRepository {
  getStats(): Promise<{
    totalMatches: number;
    totalSubmissions: number;
    languages: Record<string, number>;
    problems: Record<string, number>;
  }>;
}

export class ArenaAdminRepository implements IArenaAdminRepository {
  async getStats(): Promise<{
    totalMatches: number;
    totalSubmissions: number;
    languages: Record<string, number>;
    problems: Record<string, number>;
  }> {
    const [
      totalMatches,
      totalSubmissions,
      languagesAgg,
      problemsAgg
    ] = await Promise.all([
      ArenaMatchModel.countDocuments(),
      ArenaSubmissionModel.countDocuments(),
      ArenaMatchModel.aggregate([
        { $group: { _id: "$language", count: { $sum: 1 } } }
      ]).exec(),
      ArenaMatchModel.aggregate([
        { $group: { _id: "$problemId", count: { $sum: 1 } } }
      ]).exec()
    ]);

    const languages: Record<string, number> = {};
    for (const item of languagesAgg) {
      if (item._id) languages[item._id] = item.count;
    }

    const problems: Record<string, number> = {};
    for (const item of problemsAgg) {
      if (item._id) problems[item._id] = item.count;
    }

    return {
      totalMatches,
      totalSubmissions,
      languages,
      problems,
    };
  }
}
