import { differenceInMilliseconds } from "date-fns";
import type { ArenaPlayerResult } from "../../repositories/arena/arena-match.repository";

/**
 * MatchDomainEngineService (Pure Logic)
 *
 * This service contains the 'Guts' of the competition logic.
 * It is stateless and deterministic, making it easy to unit test.
 */
export class MatchDomainEngine {
  /**
   * Calculates the score based on submission status.
   * Standardizes scoring rules (e.g., 100 for ACCEPTED, 0 otherwise).
   */
  calculateScore(status: string, currentScore: number = 0): number {
    const newScore = status === "ACCEPTED" ? 100 : 0;
    return Math.max(currentScore, newScore);
  }

  /**
   * Calculates the time taken in milliseconds from the match start.
   */
  calculateTimeTaken(startTime: Date | number, currentTime: Date): number {
    return Math.max(
      0,
      differenceInMilliseconds(currentTime, new Date(startTime)),
    );
  }

  /**
   * Determines the next submission order (1-indexed).
   * Logic: Current order if already submitted, otherwise (count of already submitted players + 1).
   */
  determineSubmissionOrder(
    currentOrder: number,
    allPlayers: { submissionOrder?: number }[],
  ): number {
    if (currentOrder > 0) return currentOrder;

    const finishedPlayers = allPlayers.filter(
      (p) => p.submissionOrder && p.submissionOrder > 0,
    ).length;

    return finishedPlayers + 1;
  }

  /**
   * Ranks players based on score (descending) and time taken (ascending).
   */
  rankPlayers(players: ArenaPlayerResult[]): ArenaPlayerResult[] {
    return [...players].sort((a, b) => {
      // 1. Primary: Higher score first
      if ((b.score || 0) !== (a.score || 0)) {
        return (b.score || 0) - (a.score || 0);
      }
      // 2. Secondary: If scores are equal, faster time first
      if ((a.timeTaken || 0) !== (b.timeTaken || 0)) {
        return (a.timeTaken || 0) - (b.timeTaken || 0);
      }
      // 3. Tertiary: Tie-breaker (submission order)
      return (a.submissionOrder || 0) - (b.submissionOrder || 0);
    });
  }
}
