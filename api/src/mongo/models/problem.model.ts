import { mongoose } from "../connection";
import type { Problem } from "../../types/problems/problem.types";

const ExampleSchema = new mongoose.Schema(
  {
    example_num: { type: Number, required: true },
    example_text: { type: String, required: true },
    images: { type: [String], default: [] },
  },
  { _id: false },
);

const CodeSnippetsSchema = new mongoose.Schema(
  {
    python: { type: String },
    cpp: { type: String },
    java: { type: String },
    javascript: { type: String },
    typescript: { type: String },
    go: { type: String },
    rust: { type: String },
  },
  { _id: false, strict: false },
);

const ProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    problem_id: { type: String, required: true, unique: true },
    frontend_id: { type: String },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    problem_slug: { type: String, required: true, unique: true },
    topics: { type: [String], default: [] },
    description: { type: String, required: true },
    examples: { type: [ExampleSchema], default: [] },
    constraints: { type: [String], default: [] },
    follow_ups: { type: [String], default: [] },
    hints: { type: [String], default: [] },
    code_snippets: { type: CodeSnippetsSchema, default: {} },
    solutions: { type: String },
  },
  {
    timestamps: true,
  },
);

ProblemSchema.index(
  { title: "text", problem_slug: "text", topics: "text" },
  { name: "problem_text_index" },
);

// Re-export from domain types for backwards compatibility
export type {
  Problem,
  Example,
  CodeSnippets,
} from "../../types/problems/problem.types";

export type ProblemDocument = Problem & mongoose.Document;

export const ProblemModel =
  mongoose.models.Problem ||
  mongoose.model<ProblemDocument>("Problem", ProblemSchema);
