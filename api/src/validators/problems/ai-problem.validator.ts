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
<<<<<<< HEAD
  // Note: Complex fields like examples/constraints are omitted from basic
  // top-level validation here but allowed in the raw payload.
  // Zod will strip them if we don't use .passthrough() or define them.
  // Given the complexity of the examples schema, we'll use .passthrough() 
  // for flexibility in internal admin tools.
=======
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
>>>>>>> prod-deploy
}).passthrough();

export type ImportedProblemInput = z.infer<typeof importedProblemSchema>;
