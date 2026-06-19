import { apiClient } from "@/lib/api-client";

export interface BugReport {
  id: string;
  title: string;
  description: string;
  type: "bug" | "ui" | "feature" | "feedback";
  images: string[];
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
}

export const reportBugAdminService = {
  getAllReports: async (): Promise<BugReport[]> => {
    const { data } = await apiClient.get("/admin/bug-reports");
    return data.data || data;
  },

  createReport: async (payload: Partial<BugReport> & { fileImages?: File[] }): Promise<BugReport> => {
    const formData = new FormData();
    formData.append("title", payload.title || "");
    formData.append("description", payload.description || "");
    formData.append("type", payload.type || "");
    formData.append("status", payload.status || "");
    if (payload.images && payload.images.length > 0) {
      payload.images.forEach(img => formData.append("images", img));
    }
    if (payload.fileImages && payload.fileImages.length > 0) {
      payload.fileImages.forEach(file => formData.append("images", file));
    }
    const { data } = await apiClient.post("/admin/bug-reports", formData);
    return data.data || data;
  },

  updateReport: async (id: string, payload: Partial<BugReport> & { fileImages?: File[] }): Promise<BugReport> => {
    const formData = new FormData();
    formData.append("title", payload.title || "");
    formData.append("description", payload.description || "");
    formData.append("type", payload.type || "");
    formData.append("status", payload.status || "");
    if (payload.images && payload.images.length > 0) {
      payload.images.forEach(img => formData.append("images", img));
    }
    if (payload.fileImages && payload.fileImages.length > 0) {
      payload.fileImages.forEach(file => formData.append("images", file));
    }
    const { data } = await apiClient.put(`/admin/bug-reports/${id}`, formData);
    return data.data || data;
  },

  deleteReport: async (id: string): Promise<void> => {
    const { data } = await apiClient.delete(`/admin/bug-reports/${id}`);
    return data;
  },
};
