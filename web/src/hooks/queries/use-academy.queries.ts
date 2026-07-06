"use client";

import { useQuery } from "@tanstack/react-query";
import { getAcademyTracks, getTrackConfig, getTrackConcept, getTrackExercise, getSolvedExercises } from "@/services/queries/academy.queries";
import type { Track, TrackConfigResponse, TrackConceptResponse, TrackExerciseResponse } from "@/types/academy";
import { useAuth } from "@clerk/nextjs";

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

/**
 * Hook to fetch the specific configuration and syllabus for a track.
 */
export function useTrackConfigQuery(slug: string) {
  return useQuery<TrackConfigResponse, Error>({
    queryKey: ["academy-track-config", slug],
    queryFn: () => getTrackConfig(slug),
    staleTime: Infinity, // The static config won't change during the session
    enabled: !!slug, // Only run the query if a slug is provided
  });
}

/**
 * Hook to fetch the specific concept lesson content.
 */
export function useTrackConceptQuery(trackSlug: string, conceptSlug: string) {
  return useQuery<TrackConceptResponse, Error>({
    queryKey: ["academy-track-concept", trackSlug, conceptSlug],
    queryFn: () => getTrackConcept(trackSlug, conceptSlug),
    staleTime: Infinity, // The static markdown won't change during the session
    enabled: !!trackSlug && !!conceptSlug, // Only run if both slugs are provided
  });
}

/**
 * Hook to fetch the specific exercise content.
 */
export function useTrackExerciseQuery(trackSlug: string, exerciseSlug: string) {
  return useQuery<TrackExerciseResponse, Error>({
    queryKey: ["academy-track-exercise", trackSlug, exerciseSlug],
    queryFn: () => getTrackExercise(trackSlug, exerciseSlug),
    staleTime: Infinity, // The static exercise data won't change during the session
  });
}

/**
 * Hook to fetch the solved exercises for a track for the authenticated user.
 */
export function useSolvedExercisesQuery(trackSlug: string) {
  const { isSignedIn } = useAuth();

  return useQuery<string[], Error>({
    queryKey: ["academy-solved-exercises", trackSlug],
    queryFn: () => getSolvedExercises(trackSlug),
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    enabled: !!trackSlug && !!isSignedIn,
  });
}
