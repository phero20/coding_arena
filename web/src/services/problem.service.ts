import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Problem, PaginationMeta } from "@/types/api";

export class ProblemService {
  async createOrUpdateProblem(payload: Problem): Promise<Problem> {
    const response = await apiClient.post<ApiResponse<Problem>>(
      "/problems",
      payload,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to create problem");
    }

    return response.data.data;
  }

  async getProblemBySlug(slug: string): Promise<Problem> {
    const response = await apiClient.get<ApiResponse<Problem>>(
      `/problems/${slug}`,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Problem not found");
    }

    return response.data.data;
  }

  async getProblemById(problemId: string): Promise<Problem> {
    const response = await apiClient.get<ApiResponse<Problem>>(
      `/problems/id/${problemId}`,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Problem not found");
    }

    return response.data.data;
  }

  async getProblemsByTopic(topic: string, limit?: number): Promise<Problem[]> {
    const response = await apiClient.get<ApiResponse<Problem[]>>(
      `/problems/topic/${encodeURIComponent(topic)}`,
      {
        params: limit ? { limit } : undefined,
      },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to fetch problems");
    }

    return response.data.data;
  }

  async getProblems(
    page = 1,
    limit = 20,
  ): Promise<{ problems: Problem[]; meta: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<Problem[]>>("/problems", {
      params: { page, limit },
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to fetch problems");
    }

    return {
      problems: response.data.data,
      meta: response.data.meta as PaginationMeta,
    };
  }
}

export const problemService = new ProblemService();
