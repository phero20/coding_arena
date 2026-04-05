import type { 
  Submission, 
  CreateSubmissionInput 
} from '../types/submission.types'
import type {
  ISubmissionRepository,
  UpdateSubmissionStatusInput,
} from '../repositories/submission.repository'

import type { ArenaMatchRepository } from '../repositories/arena-match.repository'
import type { ArenaRepository } from '../repositories/arena.repository'
import type { ArenaMatch } from '../mongo/models/arena-match.model'

export class SubmissionService {
  constructor(
    private readonly submissionRepository: ISubmissionRepository,
    private readonly arenaMatchRepository: ArenaMatchRepository,
    private readonly arenaRepository: ArenaRepository,
  ) {}

  /**
   * Creates a new submission record.
   *
   * This is a thin wrapper over the repository and will later
   * be extended to coordinate with the execution/judge service.
   */
  createSubmission(input: CreateSubmissionInput): Promise<Submission> {
    return this.submissionRepository.createSubmission(input)
  }

  /**
   * Updates the status and optional execution metadata for a submission.
   */
  updateSubmissionStatus(
    input: UpdateSubmissionStatusInput,
  ): Promise<Submission | null> {
    return this.submissionRepository.updateSubmissionStatus(input)
  }

  /**
   * Fetches a submission by its identifier.
   */
  getSubmissionById(id: string): Promise<Submission | null> {
    return this.submissionRepository.findById(id)
  }

  /**
   * Fetches all submissions for a specific user and problem.
   */
  getUserSubmissions(userId: string, problemId: string): Promise<Submission[]> {
    return this.submissionRepository.findByUserAndProblem(userId, problemId)
  }

  /**
   * Fetches an Arena Match by its identifier.
   */
  getArenaMatchById(id: string): Promise<ArenaMatch | null> {
    return this.arenaMatchRepository.findById(id)
  }

  /**
   * Fetches an Arena Room from Redis for high-performance status checks.
   */
  getArenaRoom(roomId: string) {
    return this.arenaRepository.getRoom(roomId)
  }
}

