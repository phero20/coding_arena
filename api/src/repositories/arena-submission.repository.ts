import { MongoBaseRepository } from './base.repository'
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


export class ArenaSubmissionRepository extends MongoBaseRepository<ArenaSubmission, ArenaSubmissionDocument> {
  constructor() {
    super(ArenaSubmissionModel);
  }

  async create(input: CreateArenaSubmissionInput): Promise<ArenaSubmission> {
    const doc = await this.model.create(input)
    return this.toDomain(doc)!
  }

  async findByMatchId(matchId: string): Promise<ArenaSubmission[]> {
    const docs = await this.model.find({ matchId })
      .sort({ createdAt: 1 })
      .exec()

    return this.toDomainArray(docs);
  }

  async getSubmissionOrder(matchId: string): Promise<number> {
    const count = await this.model.countDocuments({ 
      matchId,
      status: 'ACCEPTED' 
    }).exec()
    return count
  }


  async findByUserAndMatch(userId: string, matchId: string): Promise<ArenaSubmission | null> {
    const doc = await this.model.findOne({ userId, matchId }).exec()
    return this.toDomain(doc)
  }

  async findAllSubmissionIdsByUser(userId: string): Promise<string[]> {
    const docs = await this.model.find({ userId })
      .select('submissionId')
      .exec()
    return docs.map(doc => doc.submissionId)
  }
}
