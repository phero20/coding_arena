export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  perPage: number;
  totalPages: number;
  currentPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta | Record<string, unknown>;
}

export interface BackendUser {
  id: string;
  clerkId: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  status: string;
  role: string;
}

export interface ProblemExample {
  example_num: number;
  example_text: string;
  images: string[];
}

export interface ProblemCodeSnippets {
  [language: string]: string | undefined;
}

export interface Problem {
  title: string;
  problem_id: string;
  frontend_id?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  problem_slug: string;
  topics: string[];
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  follow_ups: string[];
  hints: string[];
  code_snippets: ProblemCodeSnippets;
  solutions?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProblemDifficulty = Problem["difficulty"];

export type ProblemTestType = "public" | "hidden" | "stress" | "ai_eval";

export interface ProblemTestCase {
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
  cases: ProblemTestCase[];
  createdAt: string;
  updatedAt: string;
}
