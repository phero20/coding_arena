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
  rank?: number | null;
}

export interface UserActivityLog {
  userId: string;
  date: string; // ISO Date YYYY-MM-DD
  pointsEarned: number;
  arenaPointsEarned: number;
  submissions: number;
  matches: number;
}

export interface LeetCodeStats {
  solved: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
  };
  contest: {
    rating: number;
    globalRank: number;
    totalParticipants: number;
    topPercentile: number;
    attended: number;
    history: { rating: number; date: string }[];
  } | null;
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
  leetcode?: LeetCodeStats | null;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  points: number;
  rank: number;
  totalSolved: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  viewerRank?: LeaderboardEntry | null;
}
