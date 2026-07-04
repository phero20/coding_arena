import { useState } from "react";
import { useArenaHistoryPaginationQuery } from "./queries/use-arena.queries";

export function useArenaPagination(username: string, limit: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * limit;

  const { 
    data, 
    isLoading, 
    isFetching,
    isError, 
    error,
    refetch 
  } = useArenaHistoryPaginationQuery(username, limit, offset);

  const totalCount = data?.pagination?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const matches = data?.matches || [];

  return {
    matches,
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
