import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { RunAcademyExerciseDto, ExerciseRunResult } from "@/types/academy";

/**
 * Execute the academy exercise code and get the result.
 */
export async function runAcademyExercise(
  trackSlug: string,
  exerciseSlug: string,
  payload: RunAcademyExerciseDto
): Promise<ExerciseRunResult> {
  const response = await apiClient.post<ApiResponse<ExerciseRunResult>>(
    `/academy/tracks/${trackSlug}/exercises/${exerciseSlug}/run`,
    payload
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to run exercise");
  }

  return response.data.data;
}
