import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRecentSubmissionsPaginationQuery } from "@/hooks/queries/use-submission.queries";
import { type ExecutionVerdict } from "@/types/submission";

export function useActivityPagination(username?: string, limit: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * limit;

  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch,
    isFetching
  } = useRecentSubmissionsPaginationQuery(limit, offset, username);

  const activities = useMemo(() => {
    const rawSubmissions = data?.submissions || [];
    
    return rawSubmissions.map((submission: any) => {
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
  }, [data?.submissions]);

  const totalCount = data?.pagination?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    activities,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount
  };
}
