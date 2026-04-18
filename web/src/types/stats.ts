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
  languageCounts?: Record<string, number>; // e.g. { java: 12, python: 5 }
}

export interface UserActivityLog {
  userId: string;
  date: string; // ISO Date YYYY-MM-DD
  pointsEarned: number;
  arenaPointsEarned: number;
  submissions: number;
  matches: number;
}

export interface UserProfileData {
  user: {
    id: string;
    clerkId: string;
    username: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    githubUsername?: string | null;
    linkedinUsername?: string | null;
    leetcodeUsername?: string | null;
    joinedAt: string;
  };
  stats: UserStats;
  activityLog: UserActivityLog[];
  social: {
    followers: number;
    following: number;
    isFollowing: boolean;
  };
}

export interface LeaderboardEntry extends UserStats {
  // If we ever join with username in the repo, we'd add it here
  // For now, it matches UserStats
}
