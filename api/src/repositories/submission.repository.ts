import { MongoBaseRepository } from './base.repository'
import { SubmissionModel } from '../mongo/models/submission.model'
import type { Submission, SubmissionStatus, CreateSubmissionInput, UpdateSubmissionInput } from '../types/submission.types'
import type { SubmissionDocument } from '../mongo/models/submission.model'

// Re-export for external consumers
export type { CreateSubmissionInput, UpdateSubmissionInput } from '../types/submission.types'

export interface UpdateSubmissionStatusInput {
  id: string
  status: SubmissionStatus
  time?: number
  memory?: number
  details?: unknown
}

export interface ISubmissionRepository {
  createSubmission(input: CreateSubmissionInput): Promise<Submission>
  updateSubmissionStatus(
    input: UpdateSubmissionStatusInput,
  ): Promise<Submission | null>
  findById(id: string): Promise<Submission | null>
  findByUserAndProblem(
    userId: string,
    problemId: string,
    excludeIds?: string[],
  ): Promise<Submission[]>
}

export class SubmissionRepository 
  extends MongoBaseRepository<Submission, SubmissionDocument>
  implements ISubmissionRepository 
{
  constructor() {
    super(SubmissionModel);
  }

  async createSubmission(input: CreateSubmissionInput): Promise<Submission> {
    const doc = await this.model.create({
      problemId: input.problemId,
      userId: input.userId,
      languageId: input.languageId,
      sourceCode: input.sourceCode,
      status: input.status ?? 'PENDING',
    })

    const submission = this.toDomain(doc)
    if (!submission) {
      throw new Error('Failed to create submission')
    }
    return submission
  }

  async updateSubmissionStatus(
    input: UpdateSubmissionStatusInput,
  ): Promise<Submission | null> {
    const doc = await this.model.findByIdAndUpdate(
      input.id,
      { $set: { status: input.status, time: input.time, memory: input.memory, details: input.details } },
      { new: true },
    ).exec()
    return this.toDomain(doc)
  }

  async findByUserAndProblem(
    userId: string,
    problemId: string,
    excludeIds: string[] = [],
  ): Promise<Submission[]> {
    const query: any = {
      userId: userId,
      problemId: problemId,
    }

    if (excludeIds.length > 0) {
      query._id = { $nin: excludeIds }
    }

    const docs = await this.model.find(query)
      .sort({ createdAt: -1 })
      .exec()

    return this.toDomainArray(docs);
  }
}
