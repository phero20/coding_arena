import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRecentSubmissionsQuery } from "@/hooks/queries/use-submission.queries";
import { type ExecutionVerdict } from "@/types/submission";


export function useActivityFeed(username?: string, pageSize: number = 10) {
  const { 
    data, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage,
    isFetchingNextPage,
    error,
    refetch
  } = useRecentSubmissionsQuery(pageSize, username);

  const activities = useMemo(() => {
    const rawSubmissions = data?.pages.flatMap(page => page.submissions) ?? [];
    
    return rawSubmissions.map((submission) => {
      const status = (submission.status || "SYSTEM_ERROR") as ExecutionVerdict | "PENDING";
      
      return {
        ...submission,
        status: status,
        formattedLang: submission.languageId
          ? submission.languageId.charAt(0).toUpperCase() + submission.languageId.slice(1)
          : "—",
        timeAgo: submission.createdAt
          ? formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })
          : "—",
      };
    });
  }, [data?.pages]);

  const latestPagination = data?.pages[data.pages.length - 1]?.pagination;

  return {
    activities,
    isLoading,
    isError,
    loadMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetchingMore: isFetchingNextPage,
    totalCount: latestPagination?.total || 0,
    error,
    refetch
  };
}
