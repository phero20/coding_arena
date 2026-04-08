import { z } from 'zod';

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);

export const UpdateStatsSchema = z.object({
  userId: z.string().uuid(),
  points: z.number().int().min(0),
  difficulty: DifficultySchema.optional(),
  isMatch: z.boolean().default(false),
});

export const LeaderboardQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export type UpdateStatsInput = z.infer<typeof UpdateStatsSchema>;
export type LeaderboardQueryInput = z.infer<typeof LeaderboardQuerySchema>;
