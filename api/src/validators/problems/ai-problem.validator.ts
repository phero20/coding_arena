import { z } from "zod";

/**
 * Schema for importing a problem for AI rewriting.
 * Matches ImportedProblemPayload interface.
 */
export const importedProblemSchema = z.object({
  title: z.string().nullable().optional(),
  problem_id: z.string().nullable().optional(), // Made optional to support frontendQuestionId
  difficulty: z.enum(["Easy", "Medium", "Hard"]).nullable().optional().default("Medium" as any),
  problem_slug: z.string().optional(), // Made optional to support titleSlug
  topics: z.array(z.string()).nullable().optional(),
  description: z.string().nullable().optional(), // Nullable for Premium problems
  paidOnly: z.boolean().nullable().optional(),
  frontendQuestionId: z.string().nullable().optional(),
  titleSlug: z.string().nullable().optional(),
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
