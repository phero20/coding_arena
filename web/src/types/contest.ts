/**
 * Defines the structure for competitive programming contests
 * aggregated from various external platforms (LeetCode, Codeforces, etc.)
 */
export interface Contest {
  id: number;
  clistId: number;
  title: string;
  description: string | null;
  platform: string;
  icon: string | null;
  startTime: string; // ISO Date String
  endTime: string;   // ISO Date String
  duration: number;  // Seconds
  href: string;
  resourceId: number | null;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
  updatedAt: string;
}

/**
 * Filter state for the contest hub
 */
export interface ContestFilters {
  platforms: string[];
  search: string;
}
