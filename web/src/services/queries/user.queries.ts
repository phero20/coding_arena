import { apiClient } from "@/lib/api-client";
import type { BackendUser } from "@/types/api";

/**
 * Perform a global search for users.
 * Matches username or full name case-insensitively.
 */
export async function searchUsers(query: string) {
  const response = await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
  
  if (!response.data.success) {
    throw new Error(response.data.error?.message || "Failed to search users");
  }

  return response.data.data as { id: string; username: string; fullName: string | null; avatarUrl: string | null }[];
}

/**
 * Fetch the currently authenticated user from our backend database.
 */
export async function getCurrentUser(): Promise<BackendUser> {
  const response = await apiClient.get(`/auth/me`);
  
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || "Failed to fetch current user");
  }

  return response.data.data;
}
