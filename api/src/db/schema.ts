<<<<<<< HEAD
import { pgTable, text, timestamp, uuid, integer, bigint, date, primaryKey, jsonb } from 'drizzle-orm/pg-core'
=======
import { pgTable, text, timestamp, uuid, integer, bigint, date, primaryKey, jsonb, foreignKey, index, boolean } from 'drizzle-orm/pg-core'
>>>>>>> prod-deploy

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
 
<<<<<<< HEAD
=======
export const userAcademyExercises = pgTable('user_academy_exercises', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  trackSlug: text('track_slug').notNull(),
  exerciseSlug: text('exercise_slug').notNull(),
  solvedAt: timestamp('solved_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.trackSlug, table.exerciseSlug] }),
  }
})

>>>>>>> prod-deploy
export const follows = pgTable('follows', {
  followerId: uuid('follower_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  followingId: uuid('following_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
  }
})

<<<<<<< HEAD
=======
export const contests = pgTable('contests', {
  id: uuid('id').defaultRandom().primaryKey(),
  clistId: integer('clist_id').notNull().unique(), // The external ID from CLIST
  title: text('title').notNull(),
  description: text('description'),
  platform: text('platform').notNull(), // e.g., 'leetcode', 'codeforces'
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  duration: integer('duration').notNull(), // in seconds
  href: text('href').notNull(), // the contest link
  resourceId: integer('resource_id'), // the internal ID for the platform in CLIST
  icon: text('icon'), // URL to the platform icon
  status: text('status').notNull().default('upcoming'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

>>>>>>> prod-deploy
// --- Types ---

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserStats = typeof userStats.$inferSelect
export type UserActivity = typeof userActivity.$inferSelect
export type UserSolvedProblem = typeof userSolvedProblems.$inferSelect
export type UserSolvedLanguage = typeof userSolvedLanguages.$inferSelect
<<<<<<< HEAD

=======
export type UserAcademyExercise = typeof userAcademyExercises.$inferSelect
export type NewUserAcademyExercise = typeof userAcademyExercises.$inferInsert
export type Contest = typeof contests.$inferSelect
export type NewContest = typeof contests.$inferInsert


// --- Taxonomy Layer (Topics \u0026 Patterns) ---

/**
 * Categories table supports a recursive tree structure.
 * This allows for Top-level Topics (Array) -\u003e Patterns (Sliding Window) -\u003e Sub-patterns.
 */
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  parentId: uuid('parent_id'),
  name: text('name').notNull(), // e.g., "Two Pointer"
  slug: text('slug').notNull().unique(), // e.g., "two-pointer"
  description: text('description'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    parentReference: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }).onDelete('cascade'),
    // Explicit index — Postgres does NOT auto-index FK columns unlike MySQL
    parentIdx: index('categories_parent_id_idx').on(table.parentId),
  }
})

/**
 * Junction table mapping Problems (from MongoDB) to Categories.
 * Allows a single problem to exist in multiple categories/patterns.
 */
export const categoryProblems = pgTable('category_problems', {
  categoryId: uuid('category_id').references(() => (categories as any).id, { onDelete: 'cascade' }).notNull(),
  problemId: text('problem_id').notNull(), // Matching MongoDB problem_id
  order: integer('order').notNull().default(0), // Solve order within the category
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.categoryId, table.problemId] }),
  }
})

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type CategoryProblem = typeof categoryProblems.$inferSelect

// --- Solutions Layer ---

export const solutions = pgTable('solutions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  problemId: text('problem_id').notNull(), // MongoDB Problem ID
  problemTitle: text('problem_title'),
  problemSlug: text('problem_slug'),
  title: text('title').notNull(),
  content: text('content').notNull(), // Markdown content
  language: text('language'), // e.g., 'java', 'python'
  upvotes: integer('upvotes').notNull().default(0),
  downvotes: integer('downvotes').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    problemIdx: index('solutions_problem_id_idx').on(table.problemId),
    userIdx: index('solutions_user_id_idx').on(table.userId),
  }
})

export const solutionVotes = pgTable('solution_votes', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  solutionId: uuid('solution_id').references(() => solutions.id, { onDelete: 'cascade' }).notNull(),
  voteType: integer('vote_type').notNull(), // 1 for upvote, -1 for downvote
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.solutionId] }),
  }
})

export type Solution = typeof solutions.$inferSelect
export type NewSolution = typeof solutions.$inferInsert
export type SolutionVote = typeof solutionVotes.$inferSelect
export type NewSolutionVote = typeof solutionVotes.$inferInsert

// --- System Design Workspaces & Diagrams Layer ---

export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    userIdx: index('workspaces_user_id_idx').on(table.userId),
  }
})

export const diagrams = pgTable('diagrams', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  documentState: jsonb('document_state'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    workspaceIdx: index('diagrams_workspace_id_idx').on(table.workspaceId),
  }
})

export type Workspace = typeof workspaces.$inferSelect
export type NewWorkspace = typeof workspaces.$inferInsert
export type Diagram = typeof diagrams.$inferSelect
export type NewDiagram = typeof diagrams.$inferInsert

// --- System Design AI Chat Layer ---

export const chatThreads = pgTable('chat_threads', {
  id: uuid('id').defaultRandom().primaryKey(),
  diagramId: uuid('diagram_id').references(() => diagrams.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    diagramIdx: index('chat_threads_diagram_id_idx').on(table.diagramId),
  }
})

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  threadId: uuid('thread_id').references(() => chatThreads.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    threadIdx: index('chat_messages_thread_id_idx').on(table.threadId),
  }
})

export type ChatThread = typeof chatThreads.$inferSelect
export type NewChatThread = typeof chatThreads.$inferInsert
export type ChatMessage = typeof chatMessages.$inferSelect
export type NewChatMessage = typeof chatMessages.$inferInsert
>>>>>>> prod-deploy
