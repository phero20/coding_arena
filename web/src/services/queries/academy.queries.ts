import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

export interface Track {
  slug: string;
  title: string;
  course: boolean;
  num_concepts: number;
  num_exercises: number;
  web_url: string;
  icon_url: string;
  tags: string[];
  last_touched_at: string | null;
  is_new: boolean;
  links: {
    self: string;
    exercises: string;
    concepts: string;
  };
}

export interface TracksResponse {
  tracks: Track[];
}

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
