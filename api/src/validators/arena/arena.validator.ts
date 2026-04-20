import { z } from "zod";

/**
 * Schema for creating a new Arena room.
 * Fields are optional as custom battles may start empty.
 */
export const createRoomSchema = z.object({
  problemId: z.string().optional(),
  problemSlug: z.string().optional(),
  difficulty: z.string().optional(),
  language: z.string().optional(),
});
export type CreateRoomInput = z.infer<typeof createRoomSchema>;

/**
 * Schema for updating a room's problem.
 * Requires problemId and problemSlug.
 */
export const updateRoomProblemSchema = z.object({
  problemId: z.string().min(1, "Problem ID is required"),
  problemSlug: z.string().min(1, "Problem Slug is required"),
  difficulty: z.string().optional(),
  language: z.string().optional(),
});
export type UpdateRoomProblemInput = z.infer<typeof updateRoomProblemSchema>;

/**
 * Schema for match parameters (shared by startMatch/getMatchStatus routes).
 */
export const matchIdParamsSchema = z.object({
  matchId: z.string().min(1, "Match ID is required"),
});

/**
 * Schema for room parameters.
 */
export const roomIdParamsSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
});
