import type {
  Submission,
  CreateSubmissionInput,
} from "../../types/submissions/submission.types";
import type {
  ISubmissionRepository,
  UpdateSubmissionStatusInput,
} from "../../repositories/submissions/submission.repository";

import type { ArenaMatchRepository } from "../../repositories/arena/arena-match.repository";
import { createLogger } from "../../libs/utils/logger";
import type { ArenaRepository } from "../../repositories/arena/arena.repository";
import type { ArenaSubmissionRepository } from "../../repositories/arena/arena-submission.repository";
import type { ArenaMatch } from "../../mongo/models/arena-match.model";

const logger = createLogger("submission-service");

import { type ICradle } from "../../libs/awilix-container";
import {
  validateServiceInput,
  CreateSubmissionSchema,
  UpdateSubmissionStatusSchema,
} from "../validation/submission.validator";

import { type IClockService } from "../common/clock.service";

export class SubmissionService {
  private readonly submissionRepository: ISubmissionRepository;
  private readonly arenaMatchRepository: ArenaMatchRepository;
  private readonly arenaRepository: ArenaRepository;
  private readonly arenaSubmissionRepository: ArenaSubmissionRepository;
  private readonly clock: IClockService;

  constructor({
    submissionRepository,
    arenaMatchRepository,
    arenaRepository,
    arenaSubmissionRepository,
    clockService,
  }: ICradle) {
    this.submissionRepository = submissionRepository;
    this.arenaMatchRepository = arenaMatchRepository;
    this.arenaRepository = arenaRepository;
    this.arenaSubmissionRepository = arenaSubmissionRepository;
    this.clock = clockService;
  }

  /**
   * Creates a new submission record.
   *
   * This is a thin wrapper over the repository and will later
   * be extended to coordinate with the execution/judge service.
   */
  createSubmission(
    input: CreateSubmissionInput,
    traceId?: string,
  ): Promise<Submission> {
    validateServiceInput(CreateSubmissionSchema, input);
    return this.submissionRepository.createSubmission(input, { traceId });
  }

  /**
   * Updates the status and optional execution metadata for a submission.
   */
  updateSubmissionStatus(
    input: UpdateSubmissionStatusInput,
    traceId?: string,
  ): Promise<Submission | null> {
    validateServiceInput(UpdateSubmissionStatusSchema, input);
    return this.submissionRepository.updateSubmissionStatus(input, { traceId });
  }

  /**
   * Fetches a submission by its identifier.
   */
  getSubmissionById(id: string): Promise<Submission | null> {
    return this.submissionRepository.findById(id);
  }

  /**
   * Fetches all submissions for a specific user and problem (excluding Arena attempts).
   */
  async getUserSubmissions(
    userId: string,
    problemId: string,
    clerkId?: string,
  ): Promise<Submission[]> {
    // 1. Fetch exclusion IDs (could be saved as Clerk ID or current internal ID)
    const [idsByClerk, idsByInternal] = await Promise.all([
      clerkId
        ? this.arenaSubmissionRepository.findAllSubmissionIdsByUser(clerkId)
        : Promise.resolve([]),
      this.arenaSubmissionRepository.findAllSubmissionIdsByUser(userId),
    ]);

    // 2. Merge and deduplicate
    const arenaIds = Array.from(new Set([...idsByClerk, ...idsByInternal]));

    return this.submissionRepository.findByUserAndProblem(
      userId,
      problemId,
      arenaIds,
    );
  }

  /**
   * Fetches an Arena Match by its identifier.
   */
  getArenaMatchById(id: string): Promise<ArenaMatch | null> {
    return this.arenaMatchRepository.findById(id);
  }

  /**
   * Fetches an Arena Room from Redis for high-performance status checks.
   */
  getArenaRoom(roomId: string) {
    return this.arenaRepository.getRoom(roomId);
  }
}
