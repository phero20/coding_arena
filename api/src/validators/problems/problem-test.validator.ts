import { z } from "zod";

/**
 * Schema for a single test case.
 */
export const testCaseSchema = z.object({
  input: z.string().min(1, "Input is required"),
  expected_output: z.string().min(1, "Expected output is required"),
  timeout_ms: z.number().optional(),
  memory_limit_mb: z.number().optional(),
  weight: z.number().optional(),
  is_sample: z.boolean().optional(),
});

/**
 * Schema for upserting multiple tests (public/hidden/etc).
 */
export const upsertTestsSchema = z.object({
  type: z.enum(["public", "hidden", "stress", "ai_eval"]),
  cases: z.array(testCaseSchema).min(1, "At least one test case is required"),
});

export type UpsertTestsInput = z.infer<typeof upsertTestsSchema>;
