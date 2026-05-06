import { mongoose } from "../connection";
import type { ProblemTest, TestCase } from "../../types/problems/problem.types";

const TestCaseSchema = new mongoose.Schema(
  {
    input: { type: mongoose.Schema.Types.Mixed, required: true },
    expected_output: { type: mongoose.Schema.Types.Mixed, required: true },
    timeout_ms: { type: Number },
    memory_limit_mb: { type: Number },
    weight: { type: Number, default: 1 },
    is_sample: { type: Boolean, default: false },
    determinism_check: {
      type: String,
      enum: ["unique", "multi_valid"],
      default: undefined,
    },
    comparator_mode: {
      type: String,
      enum: ["strict", "problem_specific"],
      default: undefined,
    },
    comparator_notes: { type: String, default: undefined },
  },
  { _id: false },
);

const ProblemTestSchema = new mongoose.Schema(
  {
    problem_id: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["public", "hidden", "stress", "ai_eval"],
      required: true,
      default: "public",
    },
    cases: {
      type: [TestCaseSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

ProblemTestSchema.index(
  { problem_id: 1, type: 1 },
  { unique: true, name: "problem_test_unique_by_type" },
);

// Re-export domain types for backwards compatibility
export type { ProblemTest, TestCase } from "../../types/problems/problem.types";

export type ProblemTestDocument = ProblemTest & mongoose.Document;

export const ProblemTestModel =
  mongoose.models.ProblemTest ||
  mongoose.model<ProblemTestDocument>("ProblemTest", ProblemTestSchema);
