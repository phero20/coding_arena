export interface User {
  id: string;
  clerkId: string;
  username: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  status: "active" | "inactive" | "banned" | "suspended";
  role: "user" | "admin" | "moderator";
  githubUsername: string | null;
  linkedinUsername: string | null;
  leetcodeUsername: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  userId: string;
  totalPoints: number;
  arenaPoints: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  arenaGames: number;
  currentStreak: number;
  bestStreak: number;
  lastSolveDate: string | null;
  languageCounts: Record<string, number>;
}

export interface UserActivity {
  userId: string;
  date: string; // YYYY-MM-DD
  pointsEarned: number;
  arenaPointsEarned: number;
  submissions: number;
  matches: number;
}

export interface UserSolvedProblem {
  userId: string;
  problemId: string;
  solvedAt: string;
}

export interface UserAcademyExercise {
  userId: string;
  trackSlug: string;
  exerciseSlug: string;
  solvedAt: string;
}

export interface UserSolvedLanguage {
  userId: string;
  problemId: string;
  languageId: string;
  solvedAt: string;
}
