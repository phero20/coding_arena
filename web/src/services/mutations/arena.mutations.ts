import { apiClient } from "@/lib/api-client";
import type { ArenaRoom } from "@/types/arena";

/**
 * Create a new arena room.
 */
export async function createRoom(params?: {
  problemId: string;
  problemSlug: string;
  difficulty: string;
  language?: string;
}) {
  const response = await apiClient.post("/arena/create", params);
  return response.data.data as ArenaRoom;
}

/**
 * Update the problem assigned to an arena room.
 */
export async function updateRoomProblem(
  roomId: string,
  details: {
    problemId: string;
    problemSlug: string;
    difficulty?: string;
    language?: string;
  },
): Promise<ArenaRoom> {
  const response = await apiClient.put(`/arena/${roomId}/problem`, details);
  return response.data.data as ArenaRoom;
}

/**
 * Start a match within an arena room.
 */
export async function startMatch(
  roomId: string,
): Promise<{ matchId: string; roomId: string }> {
  const response = await apiClient.post(`/arena/${roomId}/start`);
  return response.data.data;
}
