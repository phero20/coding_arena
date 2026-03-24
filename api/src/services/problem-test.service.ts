import type { ProblemTest } from '../mongo/models/problem-test.model'
import type {
  IProblemTestRepository,
  UpsertProblemTestInput,
} from '../repositories/problem-test.repository'

export class ProblemTestService {
  constructor(private readonly problemTestRepository: IProblemTestRepository) {}

  getTestsForProblem(
    problem_id: string,
  ): Promise<ProblemTest[]> {
    return this.problemTestRepository.findAllByProblem(problem_id)
  }

  getTestsForProblemAndType(
    problem_id: string,
    type: ProblemTest['type'],
  ): Promise<ProblemTest | null> {
    return this.problemTestRepository.findByProblemAndType(problem_id, type)
  }

  upsertTests(input: UpsertProblemTestInput): Promise<ProblemTest> {
    return this.problemTestRepository.upsertTests(input)
  }
}

