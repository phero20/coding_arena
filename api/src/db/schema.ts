import { pgTable, text, timestamp, uuid, integer, bigint, date, primaryKey, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  username: text('username').notNull().unique(),
  fullName: text('full_name'),
  email: text('email').notNull().unique(),
  avatarUrl: text('avatar_url'),
  status: text('status').notNull().default('active'),
  role: text('role').notNull().default('user'),
  githubUsername: text('github_username'),
  linkedinUsername: text('linkedin_username'),
  leetcodeUsername: text('leetcode_username'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// --- Analytics Layer ---

export const userStats = pgTable('user_stats', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).primaryKey(),
  totalPoints: bigint('total_points', { mode: 'number' }).notNull().default(0), // Primary Leaderboard Metric
  arenaPoints: bigint('arena_points', { mode: 'number' }).notNull().default(0), // Exclusive Arena Combat Points
  totalSolved: integer('total_solved').notNull().default(0),
  easySolved: integer('easy_solved').notNull().default(0),
  mediumSolved: integer('medium_solved').notNull().default(0),
  hardSolved: integer('hard_solved').notNull().default(0),
  arenaGames: integer('arena_games').notNull().default(0),
  currentStreak: integer('current_streak').notNull().default(0),
  bestStreak: integer('best_streak').notNull().default(0),
  lastSolveDate: date('last_solve_date'),
  languageCounts: jsonb('language_counts').default({}).$type<Record<string, number>>(),
})

export const userActivity = pgTable('user_activity', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(), // Powers the GitHub-style graph
  pointsEarned: integer('points_earned').notNull().default(0), // Total daily points
  arenaPointsEarned: integer('arena_points_earned').notNull().default(0), // Exclusive arena daily points
  submissions: integer('submissions').notNull().default(0),
  matches: integer('matches').notNull().default(0),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.date] }), // Composite key for high-performance lookups
  }
})

export const userSolvedProblems = pgTable('user_solved_problems', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  problemId: text('problem_id').notNull(), // Matching the MongoDB problem_id string
  solvedAt: timestamp('solved_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.problemId] }),
  }
})

export const userSolvedLanguages = pgTable('user_solved_languages', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  problemId: text('problem_id').notNull(),
  languageId: text('language_id').notNull(), // e.g. 'java', 'python'
  solvedAt: timestamp('solved_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.problemId, table.languageId] }),
  }
})
 
export const follows = pgTable('follows', {
  followerId: uuid('follower_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  followingId: uuid('following_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
  }
})

// --- Types ---

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserStats = typeof userStats.$inferSelect
export type UserActivity = typeof userActivity.$inferSelect
export type UserSolvedProblem = typeof userSolvedProblems.$inferSelect
export type UserSolvedLanguage = typeof userSolvedLanguages.$inferSelect

