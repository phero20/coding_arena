import { z } from "zod";

export const createUserAdminSchema = z.object({
  clerkId: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  status: z.enum(['active', 'inactive', 'banned', 'suspended']).optional().default('active'),
  role: z.enum(['user', 'admin', 'moderator']).optional().default('user'),
  githubUsername: z.string().optional().nullable(),
  linkedinUsername: z.string().optional().nullable(),
  leetcodeUsername: z.string().optional().nullable(),
});

export const updateUserAdminSchema = createUserAdminSchema.partial();

export const createUserStatsAdminSchema = z.object({
  userId: z.string().uuid(),
  totalPoints: z.number().optional().default(0),
  arenaPoints: z.number().optional().default(0),
  totalSolved: z.number().optional().default(0),
  easySolved: z.number().optional().default(0),
  mediumSolved: z.number().optional().default(0),
  hardSolved: z.number().optional().default(0),
  arenaGames: z.number().optional().default(0),
  currentStreak: z.number().optional().default(0),
  bestStreak: z.number().optional().default(0),
  lastSolveDate: z.string().optional().nullable(),
  languageCounts: z.record(z.string(), z.number()).optional().default({}),
});

export const updateUserStatsAdminSchema = createUserStatsAdminSchema.omit({ userId: true }).partial();

export const createUserActivityAdminSchema = z.object({
  userId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  pointsEarned: z.number().optional().default(0),
  arenaPointsEarned: z.number().optional().default(0),
  submissions: z.number().optional().default(0),
  matches: z.number().optional().default(0),
});

export const updateUserActivityAdminSchema = createUserActivityAdminSchema.omit({ userId: true, date: true }).partial();

export const createUserSolvedProblemAdminSchema = z.object({
  userId: z.string().uuid(),
  problemId: z.string().min(1),
  solvedAt: z.string().optional(),
});

export const deleteUserSolvedProblemAdminSchema = z.object({
  userId: z.string().uuid(),
  problemId: z.string().min(1),
});

export const createUserAcademyExerciseAdminSchema = z.object({
  userId: z.string().uuid(),
  trackSlug: z.string().min(1),
  exerciseSlug: z.string().min(1),
  solvedAt: z.string().optional(),
});

export const deleteUserAcademyExerciseAdminSchema = z.object({
  userId: z.string().uuid(),
  trackSlug: z.string().min(1),
  exerciseSlug: z.string().min(1),
});

export const createUserSolvedLanguageAdminSchema = z.object({
  userId: z.string().uuid(),
  problemId: z.string().min(1),
  languageId: z.string().min(1),
  solvedAt: z.string().optional(),
});

export const deleteUserSolvedLanguageAdminSchema = z.object({
  userId: z.string().uuid(),
  problemId: z.string().min(1),
  languageId: z.string().min(1),
});
