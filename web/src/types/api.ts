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

export interface FunctionParameter {
  name: string;
  type: string;
}

export interface FunctionSignature {
  name: string;
  return_type: string;
  params: FunctionParameter[];
  param_order?: string[];
  testcase_serialization_version?: string;
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
  function_signature: FunctionSignature;
  solutions?: string;
  is_premium?: boolean;
  source?: string;
  source_url?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProblemDifficulty = Problem["difficulty"];

export type ProblemTestType = "public" | "hidden" | "stress" | "ai_eval";

export interface ProblemTestCase {
  input: any; // Now supports structured JSON objects
  expected_output: any; // Now supports structured JSON arrays/objects
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

export interface Solution {
  id: string;
  userId: string;
  problemId: string;
  title: string;
  content: string;
  language?: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
  author: {
    username: string;
    avatarUrl?: string | null;
    fullName?: string | null;
  };
  problemTitle?: string;
  problemSlug?: string;
}

export interface CreateSolutionInput {
  title: string;
  content: string;
  language?: string;
  problemTitle?: string;
  problemSlug?: string;
}

export interface VoteSolutionInput {
  voteType: 1 | -1;
}
