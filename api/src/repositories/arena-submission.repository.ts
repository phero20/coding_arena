import { 
  ArenaSubmission, 
  ArenaSubmissionDocument, 
  ArenaSubmissionModel 
} from '../mongo/models/arena-submission.model'
import { ArenaSubmissionVerdict } from '../mongo/models/arena-match.model'

export interface CreateArenaSubmissionInput {
  matchId: string
  userId: string
  submissionId: string
  status: ArenaSubmissionVerdict
  testsPassed: number
  totalTests: number
}


export class ArenaSubmissionRepository {
  private toSubmission(doc: ArenaSubmissionDocument | null): ArenaSubmission | null {
    if (!doc) return null
    const obj = doc.toObject()
    return {
      ...obj,
      id: doc._id.toString()
    } as ArenaSubmission
  }


  async create(input: CreateArenaSubmissionInput): Promise<ArenaSubmission> {
    const doc = await ArenaSubmissionModel.create(input)
    return this.toSubmission(doc)!
  }

  async findByMatchId(matchId: string): Promise<ArenaSubmission[]> {
    const docs = await ArenaSubmissionModel.find({ matchId })
      .sort({ createdAt: 1 })
      .exec()

    return docs.map(doc => this.toSubmission(doc)).filter((s): s is ArenaSubmission => s !== null)
  }

  async getSubmissionOrder(matchId: string): Promise<number> {
    const count = await ArenaSubmissionModel.countDocuments({ 
      matchId,
      status: 'ACCEPTED' 
    }).exec()
    return count
  }


  async findByUserAndMatch(userId: string, matchId: string): Promise<ArenaSubmission | null> {
    const doc = await ArenaSubmissionModel.findOne({ userId, matchId }).exec()
    return this.toSubmission(doc)
  }
}
