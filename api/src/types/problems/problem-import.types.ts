import type { Example, CodeSnippets, FunctionSignature } from "./problem.types";
import type { TestCase } from "./problem.types";

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
  function_signature?: FunctionSignature;
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
  function_signature: FunctionSignature;
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
