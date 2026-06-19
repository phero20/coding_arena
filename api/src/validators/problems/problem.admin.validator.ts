import { z } from "zod";
import { createProblemSchema } from "./problem.validator";

export const createAdminProblemSchema = createProblemSchema;
export const updateAdminProblemSchema = createProblemSchema.partial();

export const updateProblemTestsSchema = z.object({
  type: z.enum(["public", "hidden", "stress", "ai_eval"]),
  cases: z.array(
    z.object({
      input: z.any(),
      expected_output: z.any(),
      timeout_ms: z.number().optional(),
      memory_limit_mb: z.number().optional(),
      weight: z.number().optional(),
      is_sample: z.boolean().optional(),
      determinism_check: z.enum(["unique", "multi_valid"]).optional(),
      comparator_mode: z.enum(["strict", "problem_specific"]).optional(),
      comparator_notes: z.string().optional(),
    })
  ),
});
