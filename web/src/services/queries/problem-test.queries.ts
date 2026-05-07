import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  ProblemTest,
  ProblemTestType,
} from "@/types/api";

/**
 * Fetch all available test cases (types) for a given problem.
 */
export async function getTestsForProblem(problemId: string): Promise<ProblemTest[]> {
  const response = await apiClient.get<ApiResponse<ProblemTest[]>>(
    `/problems/${problemId}/tests`,
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch problem tests");
  }

  return response.data.data;
}

/**
 * Fetch a specific category of test cases (e.g. PUBLIC, HIDDEN) for a problem.
 */
export async function getTestsForProblemAndType(
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
