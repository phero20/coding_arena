import { z } from "zod";

/**
 * Common Zod schemas for URL parameters and query strings.
 * Centralizing these ensures consistent validation error messages 
 * across the entire API.
 */

// MongoDB ObjectId validator (24 hex characters)
const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format. Expected 24-character hex string.");

/**
 * Standard ID parameter validator (e.g. :submissionId, :matchId)
 */
export const IdParamSchema = z.object({
  id: ObjectIdSchema,
});

/**
 * Specific schemas for named parameters in Hono routes
 */
export const SubmissionIdParamSchema = z.object({
  submissionId: ObjectIdSchema,
});

export const MatchIdParamSchema = z.object({
  matchId: ObjectIdSchema,
});

export const ProblemIdParamSchema = z.object({
  problemId: z.string().min(1, "Problem ID is required."), // Could be numeric or slug-based
});

export const ProblemIdUnderscoreParamSchema = z.object({
  problem_id: z.string().min(1, "Problem ID is required."),
});

export const RoomIdParamSchema = z.object({
  roomId: z.string().min(3, "Room ID must be at least 3 characters."),
});

/**
 * Standard Slug parameter validator (e.g. :slug)
 */
export const SlugParamSchema = z.object({
  slug: z.string().min(1, "Slug is required.").regex(/^[a-z0-9-]+$/, "Invalid slug format."),
});

/**
 * Standard pagination query validator
 */
export const PaginationQuerySchema = z.object({
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  offset: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 0)),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
});
