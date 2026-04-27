import { MongoBaseRepository } from "../base.repository";
import { SubmissionModel } from "../../mongo/models/submission.model";
import type {
  Submission,
  SubmissionStatus,
  CreateSubmissionInput,
  UpdateSubmissionInput,
} from "../../types/submissions/submission.types";
import type { SubmissionDocument } from "../../mongo/models/submission.model";
import { type RepositoryOptions } from "../base.repository";

// Re-export for external consumers
export type {
  CreateSubmissionInput,
  UpdateSubmissionInput,
} from "../../types/submissions/submission.types";

export interface UpdateSubmissionStatusInput {
  id: string;
  status: SubmissionStatus;
  time?: number;
  memory?: number;
  details?: unknown;
}

export interface ISubmissionRepository {
  createSubmission(
    input: CreateSubmissionInput,
    options?: RepositoryOptions,
  ): Promise<Submission>;
  updateSubmissionStatus(
    input: UpdateSubmissionStatusInput,
    options?: RepositoryOptions,
  ): Promise<Submission | null>;
  findById(id: string, options?: RepositoryOptions): Promise<Submission | null>;
  findByUserAndProblem(
    userId: string,
    problemId: string,
    excludeIds?: string[],
  ): Promise<Submission[]>;
}

import { type ICradle } from "../../libs/awilix-container";

import { type IClockService } from "../../services/common/clock.service";

export class SubmissionRepository
  extends MongoBaseRepository<Submission, SubmissionDocument>
  implements ISubmissionRepository
{
  private readonly clock: IClockService;

  constructor({ clockService }: ICradle) {
    super(SubmissionModel);
    this.clock = clockService;
  }

  async createSubmission(
    input: CreateSubmissionInput,
    options?: RepositoryOptions,
  ): Promise<Submission> {
    const [doc] = await this.model.create(
      [
        {
          problemId: input.problemId,
          userId: input.userId,
          languageId: input.languageId,
          sourceCode: input.sourceCode,
          status: input.status ?? "PENDING",
        },
      ],
      { session: options?.session },
    );

    const submission = this.toDomain(doc);
    if (!submission) {
      throw new Error("Failed to create submission");
    }
    return submission;
  }

  async updateSubmissionStatus(
    input: UpdateSubmissionStatusInput,
    options?: RepositoryOptions,
  ): Promise<Submission | null> {
    const query = this.model
      .findByIdAndUpdate(
        input.id,
        {
          $set: {
            status: input.status,
            time: input.time,
            memory: input.memory,
            details: input.details,
          },
        },
        { returnDocument: "after" },
      )
      .lean();
    this.applyOptions(query, options);

    const doc = await query.exec();
    return this.toDomain(doc as any);
  }

  async findByUserAndProblem(
    userId: string,
    problemId: string,
    excludeIds: string[] = [],
    options?: RepositoryOptions,
  ): Promise<Submission[]> {
    const query: Record<string, unknown> = {
      userId: userId,
      problemId: problemId,
    };

    if (excludeIds.length > 0) {
      query._id = { $nin: excludeIds };
    }

    const mQuery = this.model.find(query).sort({ createdAt: -1 });
    this.applyOptions(mQuery, options);

    const docs = await mQuery.exec();

    return this.toDomainArray(docs);
  }
}
