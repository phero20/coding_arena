import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { BugReport } from "@/types/report-bug";

export class ReportBugService {
  static async submitReportBug(formData: FormData): Promise<BugReport> {
    const response = await apiClient.post<ApiResponse<BugReport>>(
      "/report-bug",
      formData
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to submit bug report");
    }

    return response.data.data;
  }
}
