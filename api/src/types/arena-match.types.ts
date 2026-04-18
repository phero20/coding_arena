import { z } from "zod";

/**
 * Zod Schemas for runtime validation of complex aggregation results.
 * This satisfies the "Zero Leak" policy for database outputs.
 * 
 * We use Zod for the detailed aggregation results because they join
 * multiple collections (Matches, ArenaSubmissions, Submissions) into
 * a shape that doesn't exist in a single MongoDB document.
 */

export const zArenaPlayerDetailed = z.object({
  userId: z.string(),
  username: z.string(),
  avatarUrl: z.string().optional(),
  finalRank: z.number().optional(),
  submissionOrder: z.number().default(0),
  verdict: z.enum([
    "ACCEPTED",
    "WRONG_ANSWER",
    "TLE",
    "RUNTIME_ERROR",
    "COMPILATION_ERROR",
    "SYSTEM_ERROR",
    "NOT_SUBMITTED",
  ]),
  score: z.number().default(0),
  testsPassed: z.number().default(0),
  totalTests: z.number().default(0),
  submittedAt: z.coerce.date().optional(),
  timeTaken: z.number().optional(),
  sourceCode: z.string().optional(),
  languageId: z.string().optional(),
});

export const zArenaMatchDetailed = z.object({
  _id: z.any(), // Transformed to id string
  roomId: z.string(),
  hostId: z.string(),
  problemId: z.string(),
  language: z.string(),
  status: z.enum(["WAITING", "PLAYING", "COMPLETED"]),
  expiresAt: z.coerce.date(),
  startedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  players: z.array(zArenaPlayerDetailed),
}).transform((data) => ({
  ...data,
  id: data._id.toString(),
}));

// Inferred Types
export type ArenaPlayerDetailed = z.infer<typeof zArenaPlayerDetailed>;
export type ArenaMatchDetailed = z.infer<typeof zArenaMatchDetailed>;
