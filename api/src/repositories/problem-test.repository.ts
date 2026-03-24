import type {
  ProblemTest,
  ProblemTestDocument,
  TestCase,
} from '../mongo/models/problem-test.model'
import { ProblemTestModel } from '../mongo/models/problem-test.model'

export interface UpsertProblemTestInput {
  problem_id: string
  type: ProblemTest['type']
  cases: TestCase[]
}

export interface IProblemTestRepository {
  findByProblemAndType(
    problem_id: string,
    type: ProblemTest['type'],
  ): Promise<ProblemTest | null>
  findAllByProblem(problem_id: string): Promise<ProblemTest[]>
  upsertTests(input: UpsertProblemTestInput): Promise<ProblemTest>
}

export class ProblemTestRepository implements IProblemTestRepository {
  private toProblemTest(doc: ProblemTestDocument | null): ProblemTest | null {
    if (!doc) return null
    const json = doc.toJSON() as any
    delete json.__v
    return json as ProblemTest
  }

  async findByProblemAndType(
    problem_id: string,
    type: ProblemTest['type'],
  ): Promise<ProblemTest | null> {
    const doc = await ProblemTestModel.findOne({ problem_id, type }).exec()
    return this.toProblemTest(doc)
  }

  async findAllByProblem(problem_id: string): Promise<ProblemTest[]> {
    const docs = await ProblemTestModel.find({ problem_id }).exec()
    return docs.map((d) => this.toProblemTest(d)!) as ProblemTest[]
  }

  async upsertTests(input: UpsertProblemTestInput): Promise<ProblemTest> {
    const doc = await ProblemTestModel.findOneAndUpdate(
      { problem_id: input.problem_id, type: input.type },
      {
        $set: {
          cases: input.cases,
        },
      },
      {
        returnDocument: 'after',
        upsert: true,
      },
    ).exec()

    const problemTest = this.toProblemTest(doc)
    if (!problemTest) {
      throw new Error('Failed to create or update problem tests')
    }
    return problemTest
  }
}

