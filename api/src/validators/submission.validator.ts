import { z } from "zod";

/**
 * Schema for running code samples (ephemeral).
 */
export const runSubmissionSchema = z.object({
  problemId: z.string().min(1, "Problem ID is required"),
  languageId: z.string().min(1, "Language ID is required"),
  sourceCode: z.string().min(1, "Source code is required"),
});
export type RunSubmissionInput = z.infer<typeof runSubmissionSchema>;

/**
 * Schema for formal submissions.
 */
export const submitSubmissionSchema = z.object({
  problemId: z.string().min(1, "Problem ID is required"),
  languageId: z.string().min(1, "Language ID is required"),
  sourceCode: z.string().min(1, "Source code is required"),
  arenaMatchId: z.string().optional(),
});
export type SubmitSubmissionInput = z.infer<typeof submitSubmissionSchema>;
