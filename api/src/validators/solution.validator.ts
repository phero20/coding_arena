import { z } from 'zod';

export const createSolutionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  content: z.string().min(20, "Content must be at least 20 characters"),
  language: z.string().optional(),
  problemTitle: z.string().optional(),
  problemSlug: z.string().optional(),
});

export const voteSolutionSchema = z.object({
  voteType: z.number().refine((v) => v === 1 || v === -1, {
    message: "Vote must be 1 (up) or -1 (down)"
  }),
});

export type CreateSolutionInput = z.infer<typeof createSolutionSchema>;
export type VoteSolutionInput = z.infer<typeof voteSolutionSchema>;
