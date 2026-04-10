import { apiClient } from "@/lib/api-client";

// Re-defining the types for the frontend to maintain consistency with the backend
export type ArenaRoomStatus = "WAITING" | "PLAYING" | "FINISHED" | "LOBBY";

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
}

export interface ArenaRoom {
  roomId: string;
  status: ArenaRoomStatus;
  topic?: string;
  problemId?: string;
  problemSlug?: string;
  difficulty?: string;
  language?: string;
  players: Record<string, ArenaPlayer>;
  createdAt: string;
  startTime?: string;
  winnerId?: string;
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
    | "HOST_TRANSFERRED";
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

export interface ArenaPlayerResult {
  userId: string;
  username: string;
  avatarUrl?: string;
  finalRank?: number;
  submissionOrder: number;
  verdict: string;
  score: number;
  testsPassed: number;
  totalTests: number;
  submittedAt?: string;
}

export interface ArenaMatch {
  id: string;
  roomId: string;
  hostId: string;
  problemId: string;
  language: string;
  status: string;
  players: ArenaPlayerResult[];
  startedAt?: string;
  endedAt?: string;
}

export const arenaService = new ArenaService();
