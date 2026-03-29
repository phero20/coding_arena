import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  ProblemTest,
  ProblemTestCase,
  ProblemTestType,
} from "@/types/api";

export interface UpsertProblemTestsPayload {
  type: ProblemTestType;
  cases: ProblemTestCase[];
}

export class ProblemTestService {
  async upsertTestsForProblem(
    problemId: string,
    payload: UpsertProblemTestsPayload,
  ): Promise<ProblemTest> {
    const response = await apiClient.post<ApiResponse<ProblemTest>>(
      `/problems/${problemId}/tests`,
      payload,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message || "Failed to upsert problem tests",
      );
    }

    return response.data.data;
  }

  async getTestsForProblem(problemId: string): Promise<ProblemTest[]> {
    const response = await apiClient.get<ApiResponse<ProblemTest[]>>(
      `/problems/${problemId}/tests`,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to fetch problem tests");
    }

    return response.data.data;
  }

  async getTestsForProblemAndType(
    problemId: string,
    type: ProblemTestType,
  ): Promise<ProblemTest> {
    const response = await apiClient.get<ApiResponse<ProblemTest>>(
      `/problems/${problemId}/tests/${type}`,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message ||
          "Failed to fetch problem tests for given type",
      );
    }

    return response.data.data;
  }
}

export const problemTestService = new ProblemTestService();

