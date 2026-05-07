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
  timeTaken?: number;
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
  timeTaken?: number;
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
