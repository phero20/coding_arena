import { mongoose } from '../connection'

const TestCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    expected_output: { type: String, required: true },
    timeout_ms: { type: Number },
    memory_limit_mb: { type: Number },
    weight: { type: Number, default: 1 },
    is_sample: { type: Boolean, default: false },
  },
  { _id: false },
)

const ProblemTestSchema = new mongoose.Schema(
  {
    problem_id: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['public', 'hidden', 'stress', 'ai_eval'],
      required: true,
      default: 'public',
    },
    cases: {
      type: [TestCaseSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

ProblemTestSchema.index(
  { problem_id: 1, type: 1 },
  { unique: true, name: 'problem_test_unique_by_type' },
)

export interface TestCase {
  input: string
  expected_output: string
  timeout_ms?: number
  memory_limit_mb?: number
  weight?: number
  is_sample?: boolean
}

export interface ProblemTest {
  problem_id: string
  type: 'public' | 'hidden' | 'stress' | 'ai_eval'
  cases: TestCase[]
  createdAt: Date
  updatedAt: Date
}

export type ProblemTestDocument = ProblemTest & mongoose.Document

export const ProblemTestModel =
  mongoose.models.ProblemTest ||
  mongoose.model<ProblemTestDocument>('ProblemTest', ProblemTestSchema)

