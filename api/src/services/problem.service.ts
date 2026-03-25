import type { Problem } from "../mongo/models/problem.model";
import type {
  CreateOrUpdateProblemInput,
  IProblemRepository,
} from "../repositories/problem.repository";

export class ProblemService {
  constructor(private readonly problemRepository: IProblemRepository) {}

  getProblemBySlug(slug: string): Promise<Problem | null> {
    return this.problemRepository.findBySlug(slug);
  }

  getProblemById(problem_id: string): Promise<Problem | null> {
    return this.problemRepository.findByProblemId(problem_id);
  }

  searchByTopic(topic: string, limit?: number): Promise<Problem[]> {
    return this.problemRepository.searchByTopic(topic, limit);
  }

  getAllProblems(
    page: number,
    limit: number,
  ): Promise<{ problems: Problem[]; total: number }> {
    return this.problemRepository.findPaginated(page, limit);
  }

  upsertProblem(input: CreateOrUpdateProblemInput): Promise<Problem> {
    return this.problemRepository.createOrUpdate(input);
  }
}
