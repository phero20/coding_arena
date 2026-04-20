import { MongoBaseRepository } from "../base.repository";
import type {
  ProblemTest,
  ProblemTestDocument,
  TestCase,
} from "../../mongo/models/problem-test.model";
import { ProblemTestModel } from "../../mongo/models/problem-test.model";

export interface UpsertProblemTestInput {
  problem_id: string;
  type: ProblemTest["type"];
  cases: TestCase[];
}

export interface IProblemTestRepository {
  findByProblemAndType(
    problem_id: string,
    type: ProblemTest["type"],
  ): Promise<ProblemTest | null>;
  findAllByProblem(problem_id: string): Promise<ProblemTest[]>;
  upsertTests(input: UpsertProblemTestInput): Promise<ProblemTest>;
}

import { type ICradle } from "../../libs/awilix-container";

export class ProblemTestRepository
  extends MongoBaseRepository<ProblemTest, ProblemTestDocument>
  implements IProblemTestRepository
{
  constructor(_: ICradle) {
    super(ProblemTestModel);
  }

  async findByProblemAndType(
    problem_id: string,
    type: ProblemTest["type"],
  ): Promise<ProblemTest | null> {
    const doc = await this.model.findOne({ problem_id, type }).exec();
    return this.toDomain(doc);
  }

  async findAllByProblem(problem_id: string): Promise<ProblemTest[]> {
    const docs = await this.model.find({ problem_id }).exec();
    return this.toDomainArray(docs);
  }

  async upsertTests(input: UpsertProblemTestInput): Promise<ProblemTest> {
    const doc = await this.model
      .findOneAndUpdate(
        { problem_id: input.problem_id, type: input.type },
        {
          $set: {
            cases: input.cases,
          },
        },
        {
          returnDocument: "after",
          upsert: true,
        },
      )
      .exec();

    const problemTest = this.toDomain(doc);
    if (!problemTest) {
      throw new Error("Failed to create or update problem tests");
    }
    return problemTest;
  }
}
