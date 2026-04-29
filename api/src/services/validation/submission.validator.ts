import { z } from "zod";
import { AppError } from "../../utils/app-error";
import { ERRORS } from "../../constants/errors";

/**
 * Standardized service-level validation guard.
 */
export function validateServiceInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw AppError.from(ERRORS.COMMON.BAD_REQUEST, { 
      details: result.error.issues 
    });
  }
  return result.data;
}

// --- Schemas ---

export const CreateSubmissionSchema = z.object({
  problemId: z.string().min(1),
  userId: z.string().optional(), // Clerk ID
  clerkUserId: z.string().optional(),
  languageId: z.coerce.string().min(1),
  sourceCode: z.string().min(1),
  status: z.string().optional(),
});

export const UpdateSubmissionStatusSchema = z.object({
  id: z.string().min(1),
  status: z.string(),
  time: z.number().optional(),
  memory: z.number().optional(),
  details: z.any().optional(),
});
