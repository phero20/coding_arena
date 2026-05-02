import { mongoose } from "../connection";
import type {
  Submission,
  SubmissionStatus,
} from "../../types/submissions/submission.types";

const SubmissionSchema = new mongoose.Schema(
  {
    problemId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    languageId: {
      type: String,
      required: true,
    },
    sourceCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "RUNNING",
        "ACCEPTED",
        "WRONG_ANSWER",
        "TLE",
        "RUNTIME_ERROR",
        "COMPILATION_ERROR",
        "SYSTEM_ERROR",
      ],
      required: true,
      default: "PENDING",
      index: true,
    },
    time: {
      type: Number,
    },
    memory: {
      type: Number,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

SubmissionSchema.index(
  { problemId: 1, userId: 1, createdAt: -1 },
  { name: "submission_by_problem_user_created_at" },
);

// Re-export domain types for backwards compatibility
export type {
  Submission,
  SubmissionStatus,
} from "../../types/submissions/submission.types";

export type SubmissionDocument = Submission & mongoose.Document;

export const SubmissionModel =
  mongoose.models.Submission ||
  mongoose.model<SubmissionDocument>("Submission", SubmissionSchema);
