import type { Problem } from "../mongo/models/problem.model"

export type ArenaRoomStatus = "WAITING" | "LOBBY" | "PLAYING" | "FINISHED";

export interface ArenaPlayer {
  userId: string;
  username: string;
  avatarUrl?: string;
  isReady: boolean;
  isCreator: boolean;
  score: number;
  testsPassed: number;
  totalTests: number;
  submittedAt?: Date;
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
  problem?: Problem;
  players: Record<string, ArenaPlayer>; // userId -> ArenaPlayer
  createdAt: Date;
  startTime?: Date;
  winnerId?: string;
}

export interface ArenaWSMessage {
  type: 
    | "PLAYER_JOINED" 
    | "PLAYER_LEFT" 
    | "PLAYER_READY" 
    | "MATCH_START" 
    | "PROGRESS_UPDATE" 
    | "MATCH_SUBMITTED" 
    | "MATCH_OVER" 
    | "PROBLEM_CHANGED"
    | "ERROR"
    | "CHAT";
  payload: any;
}
