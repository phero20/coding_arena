import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type {
  CompilerExecutePayload,
  CompilerExecuteResponse,
} from "@/types/compiler";
import { useMutation } from "@tanstack/react-query";

/**
 * Execute code on the compiler backend.
 * NOTE: backend expects { compiler, code, stdin } — "compiler" is the Wandbox compiler ID.
 */
export async function executeCode(
  payload: CompilerExecutePayload,
): Promise<CompilerExecuteResponse> {
  const response = await apiClient.post<ApiResponse<CompilerExecuteResponse>>(
    "/compiler/execute",
    payload,
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Execution failed");
  }

  return response.data.data;
}

/**
 * Hook for executing code in the playground.
 */
export function useExecuteMutation() {
  return useMutation({
    mutationFn: executeCode,
  });
}
