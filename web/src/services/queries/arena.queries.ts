import { apiClient } from "@/lib/api-client";
import type { ArenaRoom, ArenaMatch } from "@/types/arena";

/**
 * Fetch a single arena room by its ID.
 */
export async function getRoom(roomId: string) {
  const response = await apiClient.get(`/arena/${roomId}`);
  return response.data.data as ArenaRoom;
}

/**
 * Fetch the finalized match results or status.
 */
export async function getMatchStatus(matchId: string) {
  const response = await apiClient.get(`/arena/match/${matchId}/status`);
  return response.data.data as ArenaMatch;
}
