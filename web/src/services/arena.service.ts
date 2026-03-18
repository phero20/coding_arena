import { apiClient } from "@/lib/api-client";

// Re-defining the types for the frontend to maintain consistency with the backend
export type ArenaRoomStatus = "WAITING" | "PLAYING" | "FINISHED" | "LOBBY";

export interface ArenaPlayer {
  userId: string;
  username: string;
  avatarUrl?: string;
  isReady: boolean;
  isCreator: boolean;
  score: number;
  testsPassed: number;
  totalTests: number;
  submittedAt?: string;
  status: "CODING" | "SUBMITTED";
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
}

export interface ArenaWSMessage {
  type:
    | "PLAYER_JOINED"
    | "PLAYER_LEFT"
    | "PLAYER_READY"
    | "START_MATCH"
    | "MATCH_STARTED"
    | "PROGRESS_UPDATE"
    | "MATCH_SUBMITTED"
    | "MATCH_OVER"
    | "PROBLEM_CHANGED"
    | "ERROR"
    | "CHAT"
    | "CODE_UPDATE"
    | "OPPONENT_CODE_UPDATE"
    | "LEAVE_ROOM";
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
}

export const arenaService = new ArenaService();
