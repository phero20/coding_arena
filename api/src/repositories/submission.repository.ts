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
  ): Promise<Submission[]>
}

export class SubmissionRepository implements ISubmissionRepository {
  private toSubmission(doc: SubmissionDocument | null): Submission | null {
    if (!doc) return null
    const obj = doc.toObject()
    return {
      ...obj,
      id: doc._id.toString(),
    } as Submission
  }

  async createSubmission(input: CreateSubmissionInput): Promise<Submission> {
    const doc = await SubmissionModel.create({
      problemId: input.problemId,
      userId: input.userId,
      languageId: input.languageId,
      sourceCode: input.sourceCode,
      status: input.status ?? 'PENDING',
    })

    const submission = this.toSubmission(doc)
    if (!submission) {
      throw new Error('Failed to create submission')
    }
    return submission
  }

  async updateSubmissionStatus(
    input: UpdateSubmissionStatusInput,
  ): Promise<Submission | null> {
    const doc = await SubmissionModel.findByIdAndUpdate(
      input.id,
      { $set: { status: input.status, time: input.time, memory: input.memory, details: input.details } },
      { new: true },
    ).exec()
    return this.toSubmission(doc)
  }

  async findById(id: string): Promise<Submission | null> {
    const doc = await SubmissionModel.findById(id).exec()
    return this.toSubmission(doc)
  }

  async findByUserAndProblem(
    userId: string,
    problemId: string,
  ): Promise<Submission[]> {
    const docs = await SubmissionModel.find({
      userId: userId,
      problemId: problemId,
    })
      .sort({ createdAt: -1 })
      .exec()

    return docs
      .map((doc) => this.toSubmission(doc))
      .filter((s): s is Submission => s !== null)
  }
}
