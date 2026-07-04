import { apiClient } from "@/lib/api-client";
import type { ArenaRoom, ArenaMatch } from "@/types/arena";

/**
 * Fetch a single arena room by its ID.
 */
export async function getRoom(roomId: string) {
  const response = await apiClient.get(`/arena/${roomId}`);
  return response.data.data as ArenaRoom;
}

export async function getMatchStatus(matchId: string) {
  const response = await apiClient.get(`/arena/match/${matchId}/status`);
  return response.data.data as ArenaMatch;
}

/**
 * Fetch the match history for a specific user.
 */
export async function getArenaHistory(username: string, limit: number = 10, offset: number = 0) {
  const response = await apiClient.get(`/arena/u/${username}/history`, {
    params: { limit, offset }
  });
  return response.data.data as { matches: ArenaMatch[], pagination: { total: number, limit: number, offset: number } };
}

/**
 * Fetch detailed match data (including source codes) for a single match.
 */
export async function getMatchDetail(matchId: string) {
  const response = await apiClient.get(`/arena/match/${matchId}/details`);
  return response.data.data as ArenaMatch;
}
