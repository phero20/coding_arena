import type { ProblemTest } from "../../mongo/models/problem-test.model";
import type {
  IProblemTestRepository,
  UpsertProblemTestInput,
} from "../../repositories/problems/problem-test.repository";

export interface IProblemTestService {
  getTestsForProblem(problem_id: string): Promise<ProblemTest[]>;
  getTestsForProblemAndType(
    problem_id: string,
    type: ProblemTest["type"],
  ): Promise<ProblemTest | null>;
  upsertTests(input: UpsertProblemTestInput): Promise<ProblemTest>;
}

import { type ICradle } from "../../libs/awilix-container";

export class ProblemTestService implements IProblemTestService {
  private readonly problemTestRepository: IProblemTestRepository;

  constructor({ problemTestRepository }: ICradle) {
    this.problemTestRepository = problemTestRepository;
  }

  getTestsForProblem(problem_id: string): Promise<ProblemTest[]> {
    return this.problemTestRepository.findAllByProblem(problem_id);
  }

  getTestsForProblemAndType(
    problem_id: string,
    type: ProblemTest["type"],
  ): Promise<ProblemTest | null> {
    return this.problemTestRepository.findByProblemAndType(problem_id, type);
  }

  upsertTests(input: UpsertProblemTestInput): Promise<ProblemTest> {
    return this.problemTestRepository.upsertTests(input);
  }
}
