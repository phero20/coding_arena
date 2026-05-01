import { mongoose } from "../connection";

export type ArenaMatchStatus = "WAITING" | "PLAYING" | "COMPLETED";

export type ArenaSubmissionVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TLE"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR"
  | "SYSTEM_ERROR"
  | "NOT_SUBMITTED";

const ArenaPlayerResultSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    avatarUrl: { type: String },
    finalRank: { type: Number },
    submissionOrder: { type: Number, default: 0 },
    verdict: {
      type: String,
      enum: [
        "ACCEPTED",
        "WRONG_ANSWER",
        "TLE",
        "RUNTIME_ERROR",
        "COMPILATION_ERROR",
        "SYSTEM_ERROR",
        "NOT_SUBMITTED",
      ],
      default: "NOT_SUBMITTED",
    },
    score: { type: Number, default: 0 },
    testsPassed: { type: Number, default: 0 },
    totalTests: { type: Number, default: 0 },
    submittedAt: { type: Date },
    timeTaken: { type: Number },
  },
  { _id: false },
);

const ArenaMatchSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    hostId: {
      type: String,
      required: true,
      index: true,
    },
    problemId: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["WAITING", "PLAYING", "COMPLETED"],
      default: "WAITING",
      index: true,
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
    players: {
      type: [ArenaPlayerResultSchema],
      default: [],
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  },
);

ArenaMatchSchema.index({ hostId: 1, createdAt: -1 });
ArenaMatchSchema.index({ createdAt: -1 });
ArenaMatchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export interface ArenaPlayerResult {
  userId: string;
  username: string;
  finalRank?: number;
  submissionOrder: number;
  verdict: ArenaSubmissionVerdict;
  score: number;
  testsPassed: number;
  totalTests: number;
  submittedAt?: Date;
  timeTaken?: number;
}

export interface ArenaMatch {
  id: string;
  roomId: string;
  hostId: string;
  problemId: string;
  language: string;
  status: ArenaMatchStatus;
  startedAt?: Date;
  endedAt?: Date;
  players: ArenaPlayerResult[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

import {
  ArenaPlayerDetailed,
  ArenaMatchDetailed,
} from "../../types/arena/arena-match.types";

export type { ArenaPlayerDetailed, ArenaMatchDetailed };

export type ArenaMatchDocument = ArenaMatch & mongoose.Document;

export const ArenaMatchModel =
  mongoose.models.ArenaMatch ||
  mongoose.model<ArenaMatchDocument>("ArenaMatch", ArenaMatchSchema);
