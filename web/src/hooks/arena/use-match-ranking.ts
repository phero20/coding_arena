import { useState, useMemo } from "react";
import type { ArenaPlayerResult } from "@/types/arena";

/**
 * Hook to manage match result rankings, sorting algorithms, and viewing state.
 * @param {ArenaPlayerResult[]} rankings Unsorted or raw rankings from the match.
 * @returns {object} { sortedRankings, topThree, expandedUser, setExpandedUser }
 */
export function useMatchRanking(rankings: ArenaPlayerResult[]) {
  const [expandedUser, setExpandedUser] = useState<string | undefined>(undefined);

  const sortedRankings = useMemo(() => {
    return [...rankings].sort((a, b) => {
      // Primary: Score
      if (b.score !== a.score) return b.score - a.score;
      
      // Secondary: Speed tie-breaker
      const aTime = a.timeTaken ?? Infinity;
      const bTime = b.timeTaken ?? Infinity;
      if (aTime !== bTime) return aTime - bTime;

      // Tertiary: Submission Order
      if (a.submissionOrder && b.submissionOrder)
        return a.submissionOrder - b.submissionOrder;
      if (a.submissionOrder) return -1;
      if (b.submissionOrder) return 1;
      
      return 0;
    });
  }, [rankings]);

  const topThree = sortedRankings.slice(0, 3);

  return {
    sortedRankings,
    topThree,
    expandedUser,
    setExpandedUser,
  };
}
