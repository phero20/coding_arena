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
  function_signature: z.object({
    name: z.string(),
    return_type: z.string(),
    params: z.array(z.object({
      name: z.string(),
      type: z.string(),
    })),
  }).optional(),
}).passthrough();

export type ImportedProblemInput = z.infer<typeof importedProblemSchema>;
