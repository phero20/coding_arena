import { z } from "zod";

/**
 * Schema for creating or updating a Problem.
 */
export const createProblemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  problem_id: z.string().min(1, "Problem ID is required"),
  problem_slug: z.string().min(1, "Problem Slug is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  description: z.string().min(1, "Description is required"),
  topics: z.array(z.string()).optional(),
  category: z.string().optional(),
});
export type CreateProblemInput = z.infer<typeof createProblemSchema>;
