import { z } from "zod";

/**
 * Schema for importing a problem for AI rewriting.
 * Matches ImportedProblemPayload interface.
 */
export const importedProblemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  problem_id: z.string().min(1, "Problem ID is required"),
  frontend_id: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  problem_slug: z.string().min(1, "Problem Slug is required"),
  topics: z.array(z.string()).optional(),
  description: z.string().min(1, "Description is required"),
  // Note: Complex fields like examples/constraints are omitted from basic
  // top-level validation here but allowed in the raw payload.
  // Zod will strip them if we don't use .passthrough() or define them.
  // Given the complexity of the examples schema, we'll use .passthrough() 
  // for flexibility in internal admin tools.
}).passthrough();

export type ImportedProblemInput = z.infer<typeof importedProblemSchema>;
