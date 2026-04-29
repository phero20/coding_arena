/**
 * MatchRanker is a pure, stateless utility for calculating rankings and leaderboards.
 * Separating this logic from the service layer allows for 100% unit test coverage 
 * without needing Database or Redis connections.
 */
export interface PlayerLike {
  userId: string;
  score: number;
  timeTaken?: number;
  submissionOrder?: number;
  verdict?: string;
  [key: string]: any;
}

export interface RankedPlayer extends PlayerLike {
  finalRank: number;
}

export class MatchRanker {
  /**
   * Sorts and ranks players based on competitive programming rules:
   * 1. Highest Score wins.
   * 2. Ties are broken by lowest Time Taken (speed).
   * 3. Secondary ties are broken by Submission Order (who submitted first).
   * 
   * @param players Array of players to rank
   * @returns Array of players with 'finalRank' property injected
   */
  static rankPlayers<T extends PlayerLike>(players: T[]): (T & { finalRank: number })[] {
    if (!players || players.length === 0) return [];

    return [...players]
      .sort((a, b) => {
        // 1. Score (Descending)
        if (b.score !== a.score) return b.score - a.score;

        // 2. Speed Tie-breaker (Ascending Time Taken)
        const aTime = a.timeTaken ?? Infinity;
        const bTime = b.timeTaken ?? Infinity;
        if (aTime !== bTime) return aTime - bTime;

        // 3. Early Submission Tie-breaker (Ascending Order)
        if (a.submissionOrder === 0 && b.submissionOrder !== 0) return 1;
        if (b.submissionOrder === 0 && a.submissionOrder !== 0) return -1;
        
        const aOrder = a.submissionOrder ?? Infinity;
        const bOrder = b.submissionOrder ?? Infinity;
        
        return aOrder - bOrder;
      })
      .map((p, index) => ({
        ...p,
        finalRank: index + 1,
      }));
  }
}
