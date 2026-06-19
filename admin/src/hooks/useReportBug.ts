import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportBugAdminService, type BugReport } from "@/services/report-bug.service";
import { toast } from "sonner";

export const useReportBugAdmin = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-bug-reports"],
    queryFn: () => reportBugAdminService.getAllReports(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<BugReport>) => reportBugAdminService.createReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bug-reports"] });
      toast.success("Bug report created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to create bug report");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BugReport> }) => 
      reportBugAdminService.updateReport(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bug-reports"] });
      toast.success("Bug report updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to update bug report");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reportBugAdminService.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bug-reports"] });
      toast.success("Bug report deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to delete bug report");
    },
  });

  return {
    reports: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    createReport: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateReport: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteReport: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
