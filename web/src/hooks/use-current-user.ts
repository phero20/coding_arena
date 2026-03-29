import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { userService } from "@/services/user.service";
import type { BackendUser } from "@/types/api";

interface UseCurrentUserResult {
  backendUser: BackendUser | null;
  isLoading: boolean;
  error: Error | null;
}

export const useCurrentUser = (): UseCurrentUserResult => {
  const { isLoaded, isSignedIn } = useUser();

  const { data, isLoading, error } = useQuery({
    queryKey: ["current-user", isSignedIn],
    queryFn: () => userService.getCurrentUser(),
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // If backend says 404, we retry a few times as the webhook might be syncing
      if (error?.response?.status === 404 && failureCount < 5) return true;
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // If we get a 404 after retries, it means the user exists in Clerk but not yet in our DB sync
  const isSyncing = error instanceof Error && (error as any)?.response?.status === 404;

  return {
    backendUser: data ?? null,
    isLoading: !!((isLoading || !isLoaded || isSyncing) && isSignedIn),
    error: isSyncing ? null : (error as Error | null),
  };
};
