import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { Track, TracksResponse, TrackConfigResponse, TrackConceptResponse, TrackExerciseResponse } from "@/types/academy";

/**
 * Fetch all available learning tracks from the academy.
 */
export async function getAcademyTracks(): Promise<Track[]> {
  const response = await apiClient.get<ApiResponse<TracksResponse>>(
    "/academy/tracks"
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch academy tracks");
  }

  return response.data.data.tracks;
}



/**
 * Fetch the full config.json syllabus and exercises for a specific track.
 */
export async function getTrackConfig(slug: string): Promise<TrackConfigResponse> {
  const response = await apiClient.get<ApiResponse<TrackConfigResponse>>(
    `/academy/tracks/${slug}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || `Failed to fetch track config for ${slug}`);
  }

  return response.data.data;
}

/**
 * Fetch the specific concept markdown content for a track.
 */
export async function getTrackConcept(trackSlug: string, conceptSlug: string): Promise<TrackConceptResponse> {
  const response = await apiClient.get<ApiResponse<TrackConceptResponse>>(
    `/academy/tracks/${trackSlug}/concepts/${conceptSlug}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || `Failed to fetch concept config for ${trackSlug}/${conceptSlug}`);
  }

  return response.data.data;
}

/**
 * Fetch the exercise data (instructions, starter code, tests) for a specific track.
 */
export async function getTrackExercise(trackSlug: string, exerciseSlug: string): Promise<TrackExerciseResponse> {
  const response = await apiClient.get<ApiResponse<TrackExerciseResponse>>(
    `/academy/tracks/${trackSlug}/exercises/${exerciseSlug}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || `Failed to fetch exercise for ${trackSlug}/${exerciseSlug}`);
  }

  return response.data.data;
}

/**
 * Fetch the solved exercises for a track for the authenticated user.
 */
export async function getSolvedExercises(trackSlug: string): Promise<string[]> {
  const response = await apiClient.get<ApiResponse<string[]>>(
    `/academy/tracks/${trackSlug}/solved`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || `Failed to fetch solved exercises for ${trackSlug}`);
  }

  return response.data.data;
}
