import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { Company, CompanyProblem } from "@/types/company";

/**
 * Fetch all available companies.
 */
export async function getCompanies(): Promise<Company[]> {
  const response = await apiClient.get<ApiResponse<Company[]>>(
    "/companies"
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch companies");
  }

  return response.data.data;
}

/**
 * Fetch the specific problems for a given company.
 */
export async function getCompanyProblems(slug: string): Promise<CompanyProblem[]> {
  const response = await apiClient.get<ApiResponse<CompanyProblem[]>>(
    `/companies/${slug}/problems`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || `Failed to fetch problems for ${slug}`);
  }

  return response.data.data;
}
