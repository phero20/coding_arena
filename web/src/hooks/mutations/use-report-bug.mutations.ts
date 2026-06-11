import { useMutation } from "@tanstack/react-query";
import { ReportBugService } from "@/services/report-bug.service";
import type { ReportBugPayload, BugReport } from "@/types/report-bug";

export function useSubmitReportBugMutation() {
  return useMutation<BugReport, Error, ReportBugPayload>({
    mutationFn: (payload) => {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("description", payload.description);
      formData.append("type", payload.type);

      if (payload.images && payload.images.length > 0) {
        payload.images.forEach((file) => {
          formData.append("images", file);
        });
      }

      return ReportBugService.submitReportBug(formData);
    },
  });
}
