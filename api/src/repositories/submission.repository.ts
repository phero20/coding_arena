import type {
  Submission,
  SubmissionDocument,
  SubmissionStatus,
} from '../mongo/models/submission.model'
import { SubmissionModel } from '../mongo/models/submission.model'

export interface CreateSubmissionInput {
  problem_id: string
  user_id: string
  language_id: string
  source_code: string
  status?: SubmissionStatus
  time?: number
  memory?: number
  details?: unknown
}

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
    const json = doc.toJSON() as any
    json.id = json._id.toString()
    delete json.__v
    return json as Submission
  }

  async createSubmission(input: CreateSubmissionInput): Promise<Submission> {
    const doc = await SubmissionModel.create({
      problem_id: input.problem_id,
      user_id: input.user_id,
      language_id: input.language_id,
      source_code: input.source_code,
      status: input.status ?? 'PENDING',
      time: input.time,
      memory: input.memory,
      details: input.details,
    })

    const submission = this.toSubmission(doc)
    if (!submission) {
      throw new Error('Failed to create submission')
    }
    return submission
  }

  /**
   * Updates the existing submission by id. Never creates a new document.
   */
  async updateSubmissionStatus(
    input: UpdateSubmissionStatusInput,
  ): Promise<Submission | null> {
    const doc = await SubmissionModel.findByIdAndUpdate(
      input.id,
      { $set: { status: input.status, time: input.time, memory: input.memory, details: input.details } },
      { returnDocument: 'after' },
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
      user_id: userId,
      problem_id: problemId,
    })
      .sort({ createdAt: -1 })
      .exec()

    return docs
      .map((doc) => this.toSubmission(doc))
      .filter((s): s is Submission => s !== null)
  }
}

