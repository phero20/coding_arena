import { z } from "zod";
import { AppError } from "../../utils/app-error";
import { ERRORS } from "../../constants/errors";

/**
 * Service-level validation schemas for ArenaService.
 * This provides "Inner-Core" protection against bad data.
 */

export const CreateRoomSchema = z.object({
  clerkUserId: z.string().min(1, "Clerk User ID is required"),
  details: z.object({
    problemId: z.string().optional(),
    problemSlug: z.string().optional(),
    difficulty: z.string().optional(),
    language: z.string().optional(),
  }),
});

export const UpdateRoomProblemSchema = z.object({
  clerkUserId: z.string().min(1, "Clerk User ID is required"),
  roomId: z.string().min(1, "Room ID is required"),
  details: z.object({
    problemId: z.string().min(1, "Problem ID is required"),
    problemSlug: z.string().min(1, "Problem Slug is required"),
    difficulty: z.string().optional(),
    language: z.string().optional(),
  }),
});

export const StartMatchSchema = z.object({
  clerkUserId: z.string().min(1, "Clerk User ID is required"),
  roomId: z.string().min(1, "Room ID is required"),
});

/**
 * Helper to perform validation and throw AppError on failure.
 */
export function validateServiceInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues
      .map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    throw AppError.badRequest(message);
  }
  return result.data;
}
