import { z } from "zod";

/**
 * Schema for importing a problem for AI rewriting.
 * Matches ImportedProblemPayload interface.
 */
export const importedProblemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  problem_id: z.string().optional(), // Made optional to support frontendQuestionId
  frontend_id: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional().default("Medium"),
  problem_slug: z.string().optional(), // Made optional to support titleSlug
  topics: z.array(z.string()).optional(),
  description: z.string().nullable().optional(), // Nullable for Premium problems
  paidOnly: z.boolean().optional(),
  frontendQuestionId: z.string().optional(),
  titleSlug: z.string().optional(),
  function_signature: z.object({
    name: z.string(),
    return_type: z.string(),
    params: z.array(z.object({
      name: z.string(),
      type: z.string(),
    })),
  }).optional(),
  judging_policy: z.object({
    comparator_mode: z.enum(["strict", "problem_specific"]).optional(),
    multi_answer: z.boolean().optional(),
    validation_policy: z.string().optional(),
    output_order: z.enum(["strict", "any_order"]).optional(),
    audit_hints: z.array(z.string()).optional(),
  }).optional(),
}).passthrough();

export type ImportedProblemInput = z.infer<typeof importedProblemSchema>;
