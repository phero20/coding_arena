"use client";

import { useQuery } from "@tanstack/react-query";
import { getAcademyTracks, type Track } from "@/services/queries/academy.queries";

/**
 * Hook to fetch all academy tracks for the dashboard.
 */
export function useAcademyTracksQuery() {
  return useQuery<Track[], Error>({
    queryKey: ["academy-tracks"],
    queryFn: getAcademyTracks,
    staleTime: Infinity, // Tracks rarely change, cache indefinitely in the browser
  });
}
