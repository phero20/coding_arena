import { useState } from "react";
import { useUserSolutions } from "./queries/use-solution.queries";

/**
 * Custom hook to manage user solutions pagination state and queries.
 */
export function useSolutionPagination(username: string, limit: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * limit;

  const { 
    data, 
    isLoading, 
    isFetching,
    error,
    refetch 
  } = useUserSolutions(username, limit, offset);

  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const items = data?.items || [];

  return {
    items,
    isLoading,
    isFetching,
    error,
    refetch,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount
  };
}
