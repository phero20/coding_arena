import { apiClient } from "@/lib/api-client";
import type { ApiResponse, BackendUser } from "@/types/api";

export class UserService {
  async getCurrentUser(): Promise<BackendUser> {
    const response = await apiClient.get<ApiResponse<BackendUser>>("/me");

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to fetch current user");
    }

    return response.data.data;
  }
}

export const userService = new UserService();

