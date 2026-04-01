import { mongoose } from '../connection'
import { ArenaSubmissionVerdict } from './arena-match.model'

const ArenaSubmissionSchema = new mongoose.Schema(
  {
    matchId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    submissionId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'ACCEPTED',
        'WRONG_ANSWER',
        'TLE',
        'RUNTIME_ERROR',
        'COMPILATION_ERROR',
        'SYSTEM_ERROR',
      ],
      required: true,
    },
    testsPassed: {
      type: Number,
      required: true,
      default: 0,
    },
    totalTests: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

ArenaSubmissionSchema.index({ matchId: 1, userId: 1 })

export interface ArenaSubmission {
  matchId: string
  userId: string
  submissionId: string
  status: ArenaSubmissionVerdict
  testsPassed: number
  totalTests: number
  createdAt: Date
  updatedAt: Date
}


export type ArenaSubmissionDocument = ArenaSubmission & mongoose.Document

export const ArenaSubmissionModel =
  mongoose.models.ArenaSubmission ||
  mongoose.model<ArenaSubmissionDocument>('ArenaSubmission', ArenaSubmissionSchema)
