<<<<<<< HEAD
import type { Example, CodeSnippets } from "../../mongo/models/problem.model";
import type { TestCase } from "../../mongo/models/problem-test.model";
=======
import type {
  Example,
  CodeSnippets,
  FunctionSignature,
  ClassSignature,
  JudgingPolicy,
} from "./problem.types";
import type { TestCase } from "./problem.types";
>>>>>>> prod-deploy

export interface ImportedProblemPayload {
  title: string;
  problem_id: string;
  frontend_id?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  problem_slug: string;
  topics?: string[];
  description: string;
  examples?: Example[];
  constraints?: string[];
  follow_ups?: string[];
  hints?: string[];
  code_snippets?: CodeSnippets;
<<<<<<< HEAD
=======
  problem_type?: "function" | "class" | "interactive";
  function_signature?: FunctionSignature;
  class_signature?: ClassSignature;
  judging_policy?: JudgingPolicy;
>>>>>>> prod-deploy
  solutions?: string;
  solution?: string;
}

export interface AiGeneratedProblem {
  title: string;
  problem_id: string;
  frontend_id?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  problem_slug: string;
  topics: string[];
  description: string;
  examples: Example[];
  constraints: string[];
  follow_ups: string[];
  hints: string[];
  code_snippets: CodeSnippets;
<<<<<<< HEAD
=======
  problem_type: "function" | "class" | "interactive";
  function_signature?: FunctionSignature;
  class_signature?: ClassSignature;
  judging_policy?: JudgingPolicy;
>>>>>>> prod-deploy
  solutions?: string;
}

export interface AiGeneratedTests {
  public: TestCase[];
  hidden: TestCase[];
}

export interface AiProblemOutput {
  problem: AiGeneratedProblem;
  tests: AiGeneratedTests;
}
