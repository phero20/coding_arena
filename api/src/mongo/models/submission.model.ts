import { mongoose } from '../connection'

export type SubmissionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TLE'
  | 'RUNTIME_ERROR'
  | 'COMPILATION_ERROR'
  | 'SYSTEM_ERROR'

const SubmissionSchema = new mongoose.Schema(
  {
    problem_id: {
      type: String,
      required: true,
      index: true,
    },
    user_id: {
      // This should match the user identifier you use in Postgres / Clerk
      type: String,
      required: true,
      index: true,
    },
    language_id: {
      // Judge0 language identifier (number or string, stored as string)
      type: String,
      required: true,
    },
    source_code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'RUNNING',
        'ACCEPTED',
        'WRONG_ANSWER',
        'TLE',
        'RUNTIME_ERROR',
        'COMPILATION_ERROR',
        'SYSTEM_ERROR',
      ],
      required: true,
      default: 'PENDING',
      index: true,
    },
    time: {
      // In seconds, as reported by Judge0
      type: Number,
    },
    memory: {
      // In kilobytes, as reported by Judge0
      type: Number,
    },
    details: {
      // Optional structured details: per-test results, raw Judge0 payload, etc.
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
)

SubmissionSchema.index(
  { problem_id: 1, user_id: 1, createdAt: -1 },
  { name: 'submission_by_problem_user_created_at' },
)

export interface Submission {
  problem_id: string
  user_id: string
  language_id: string
  source_code: string
  status: SubmissionStatus
  time?: number
  memory?: number
  details?: unknown
  createdAt: Date
  updatedAt: Date
}

export type SubmissionDocument = Submission & mongoose.Document

export const SubmissionModel =
  mongoose.models.Submission ||
  mongoose.model<SubmissionDocument>('Submission', SubmissionSchema)

