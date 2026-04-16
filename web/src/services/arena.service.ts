import { apiClient } from "@/lib/api-client";

// --- MODEL OWNERSHIP DOCUMENTATION ---
// 1. Transient State (Redis-backed): Managed by Zustand (useArenaStore).
//    Includes real-time player lists, typing status, and volatile lobby info.
// 2. Persistent State (MongoDB-backed): Managed by TanStack Query (useArenaRoomQuery, useMatchResultsQuery).
//    Includes room metadata, finalized match rankings, and historical data.
// --------------------------------------

export type ArenaRoomStatus = "WAITING" | "PLAYING" | "FINISHED" | "LOBBY";

/**
 * Transient Player State (Redis/WebSocket)
 * Used for real-time updates in the store.
 */
export interface ArenaPlayer {
  userId: string;
  username: string;
  avatarUrl?: string;
  isCreator: boolean;
  score: number;
  testsPassed: number;
  totalTests: number;
  joinedAt: string;
  status: "CODING" | "SUBMITTED";
  isOffline: boolean;
  rank?: number; // Real-time ranking during match
  submissionOrder?: number; // Order of successful submission
}

/**
 * Room Metadata (MongoDB Client View)
 */
export interface ArenaRoom {
  roomId: string;
  status: ArenaRoomStatus;
  topic?: string;
  problemId?: string;
  problemSlug?: string;
  difficulty?: string;
  language?: string;
  matchDuration?: number;
  players: Record<string, ArenaPlayer>;
  createdAt: string;
  startTime?: number;
  endTime?: number;
  matchId?: string;
}

export interface ArenaWSMessage {
  type:
    | "PLAYER_JOINED"
    | "PLAYER_LEFT"
    | "PLAYER_READY"
    | "START_MATCH"
    | "MATCH_START"
    | "MATCH_STARTED"
    | "PROGRESS_UPDATE"
    | "MATCH_SUBMITTED"
    | "MATCH_OVER"
    | "MATCH_ENDED"
    | "PROBLEM_CHANGED"
    | "ERROR"
    | "CHAT"
    | "LEAVE_ROOM"
    | "PLAYER_REMOVED"
    | "LEADERBOARD_UPDATE"
    | "HOST_TRANSFERRED"
    | "UPDATE_MATCH_DURATION"
    | "MATCH_DURATION_CHANGED"
    | "KICK_PLAYER"
    | "YOU_ARE_KICKED"
    | "PLAYER_KICKED"
    | "ABORT_MATCH";
  payload: any;
}

class ArenaService {
  async createRoom(params?: {
    problemId: string;
    problemSlug: string;
    difficulty: string;
    language?: string;
  }) {
    const response = await apiClient.post("/arena/create", params);
    return response.data.data as ArenaRoom;
  }

  async getRoom(roomId: string) {
    const response = await apiClient.get(`/arena/${roomId}`);
    return response.data.data as ArenaRoom;
  }

  async updateRoomProblem(
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

  async startMatch(
    roomId: string,
  ): Promise<{ matchId: string; roomId: string }> {
    const response = await apiClient.post(`/arena/${roomId}/start`);
    return response.data.data;
  }

  async getMatchStatus(matchId: string) {
    const response = await apiClient.get(`/arena/match/${matchId}/status`);
    return response.data.data as ArenaMatch;
  }
}

/**
 * Persistent Player Result (MongoDB)
 * Used for historical match records and final rankings.
 */
export interface ArenaPlayerResult {
  userId: string;
  username: string;
  avatarUrl?: string;
  finalRank?: number;
  score: number;
  testsPassed: number;
  totalTests: number;
  verdict: "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "MEMORY_LIMIT_EXCEEDED" | "RUNTIME_ERROR" | "COMPILATION_ERROR" | "SKIPPED";
  submittedAt?: string;
  submissionOrder?: number;
  sourceCode?: string;
  languageId?: string;
}

/**
 * Match Record (MongoDB)
 */
export interface ArenaMatch {
  id: string;
  roomId: string;
  hostId: string;
  problemId: string;
  problemSlug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  language: string;
  status: "FINISHED" | "CANCELLED";
  players: ArenaPlayerResult[];
  startedAt: string;
  endedAt?: string;
}

export const arenaService = new ArenaService();
