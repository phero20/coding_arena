import { apiClient } from "@/lib/api-client";

export interface Problem {
  problem_id: string;
  problem_slug: string;
  title: string;
  difficulty: string;
  topics: string[];
  is_premium: boolean;
  problem_type: string;
}

export interface TestCase {
  input: any;
  expected_output: any;
  timeout_ms?: number;
  memory_limit_mb?: number;
  weight?: number;
  is_sample?: boolean;
  determinism_check?: "unique" | "multi_valid";
  comparator_mode?: "strict" | "problem_specific";
  comparator_notes?: string;
}

export interface ProblemTest {
  problem_id: string;
  type: "public" | "hidden" | "stress" | "ai_eval";
  cases: TestCase[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    perPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ProblemStats {
  problems: number;
  testcases: number;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  userSolvedProblems: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  userSolvedLanguages: Record<string, number>;
  totalSubmissions: number;
  submissionStatus: Record<string, number>;
}

export const problemAdminService = {
  getStats: async (): Promise<ProblemStats> => {
    const { data } = await apiClient.get("/admin/problems/stats");
    return data?.data || { 
      problems: 0, 
      testcases: 0,
      difficulty: { easy: 0, medium: 0, hard: 0, total: 0 },
      userSolvedProblems: { easy: 0, medium: 0, hard: 0, total: 0 },
      userSolvedLanguages: {}
    };
  },
  getProblems: async (params: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Problem>> => {
    const { data } = await apiClient.get("/admin/problems", { params });
    return data;
  },
  getProblemBySlug: async (slug: string): Promise<Problem | null> => {
    const { data } = await apiClient.get("/admin/problems", { params: { search: slug, limit: 1 } });
    return data?.data?.[0] || null;
  },
  getProblemById: async (id: string): Promise<Problem | null> => {
    const { data } = await apiClient.get(`/admin/problems/${id}`);
    return data?.data || null;
  },
  createProblem: async (payload: Partial<Problem>): Promise<Problem> => {
    const { data } = await apiClient.post("/admin/problems", payload);
    return data?.data || data;
  },
  updateProblem: async (id: string, payload: Partial<Problem>): Promise<Problem> => {
    const { data } = await apiClient.put(`/admin/problems/${id}`, payload);
    return data?.data || data;
  },
  deleteProblem: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/problems/${id}`);
  },
  getProblemTests: async (id: string): Promise<ProblemTest[]> => {
    const { data } = await apiClient.get(`/admin/problems/${id}/tests`);
    return data?.data || [];
  },
  updateProblemTests: async (id: string, payload: { type: string, cases: TestCase[] }): Promise<ProblemTest> => {
    const { data } = await apiClient.put(`/admin/problems/${id}/tests`, payload);
    return data?.data || data;
  }
};
