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

/**
 * Sync or update the full suite of test cases for a problem.
 */
export async function upsertTestsForProblem(
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
