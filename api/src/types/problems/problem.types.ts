export interface Example {
  example_num: number;
  example_text: string;
  images: string[];
}

export interface CodeSnippets {
  python?: string;
  cpp?: string;
  java?: string;
  javascript?: string;
  typescript?: string;
  go?: string;
  rust?: string;
  [language: string]: string | undefined;
}

export interface Problem {
  title: string;
  problem_id: string; // Keeping snake_case as requested
  frontend_id?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  problem_slug: string;
  topics: string[];
  description: string;
  examples: Example[];
  constraints: string[];
  follow_ups: string[];
  hints: string[];
  code_snippets: CodeSnippets;
  solutions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrUpdateProblemInput {
  title: string;
  problem_id: string;
  frontend_id?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  problem_slug: string;
  topics?: string[];
  description: string;
  examples?: Example[];
  constraints?: string[];
  follow_ups?: string[];
  hints?: string[];
  code_snippets?: CodeSnippets;
  solutions?: string;
}

export type ProblemTestType = 'public' | 'hidden' | 'stress' | 'ai_eval';

export interface TestCase {
  input: string;
  expected_output: string;
  timeout_ms?: number;
  memory_limit_mb?: number;
  weight?: number;
  is_sample?: boolean;
}

export interface ProblemTest {
  problem_id: string;
  type: ProblemTestType;
  cases: TestCase[];
  createdAt: Date;
  updatedAt: Date;
}
