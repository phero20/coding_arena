import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "@/services/queries/user.queries";

/**
 * Hook to perform debounced user search.
 * Managed via React Query with automatic state handling.
 */
export function useUserSearchQuery(query: string) {
  return useQuery({
    queryKey: ["user-search", query],
    queryFn: () => searchUsers(query),
    enabled: query.trim().length > 0,
    staleTime: 60000, // Search results can stay fresh for 1 min
    gcTime: 300000,   // Keep in cache for 5 mins
  });
}
