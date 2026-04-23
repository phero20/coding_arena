import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { CompilerLanguage } from "@/types/compiler";

/**
 * Fetch the list of supported compiler languages from the backend.
 * Caches for 24 hours on the server side, but standard query caching applies here.
 */
export async function getCompilerLanguages(): Promise<CompilerLanguage[]> {
  const response = await apiClient.get<ApiResponse<CompilerLanguage[]>>(
    "/compiler/languages",
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch languages");
  }

  return response.data.data;
}
