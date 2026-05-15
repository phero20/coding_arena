import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface UpdateProfilePayload {
  githubUsername?: string | null;
  linkedinUsername?: string | null;
  leetcodeUsername?: string | null;
}

/**
 * Mutation hook for updating user profile fields.
 * Automatically invalidates profile queries to instantly refresh the UI.
 */
export function useUpdateProfileMutation(currentUsername: string | undefined) {
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const response = await apiClient.patch(`/users/profile`, payload);
      return response.data;
    },
    onSuccess: () => {
      if (currentUsername) {
        // Invalidate the profile stats so the identity card re-renders with new social links
        queryClient.invalidateQueries({ queryKey: ["stats", "profile", currentUsername] });
      }
      toast.success("Profile updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update profile. Please try again.");
    },
  });

  return { updateProfile };
}
