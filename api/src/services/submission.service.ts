import type { Submission } from '../mongo/models/submission.model'
import type {
  CreateSubmissionInput,
  ISubmissionRepository,
  UpdateSubmissionStatusInput,
} from '../repositories/submission.repository'

export class SubmissionService {
  constructor(private readonly submissionRepository: ISubmissionRepository) {}

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
}

