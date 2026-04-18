import { ArenaMatchRepository } from "../repositories/arena-match.repository";
import { ArenaRepository } from "../repositories/arena.repository";
import { AppError } from "../utils/app-error";
import { ERRORS } from "../constants/errors";
import { createLogger } from "../libs/logger";

/**
 * MatchValidatorService centralizes the "Rules of Play" for matches.
 * 
 * It ensures that players can only perform actions (like submitting)
 * when they are eligible according to the live state (Redis) and 
 * permanent record (Mongo).
 */
export class MatchValidatorService {
  private readonly logger = createLogger("match-validator-service");

  constructor(
    private readonly arenaMatchRepository: ArenaMatchRepository,
    private readonly arenaRepository: ArenaRepository,
  ) {}

  /**
   * Validates if a user is eligible to submit code for a specific match.
   * Checks both Redis (live status) and MongoDB (permanent record).
   */
  async validateSubmissionEligibility(
    arenaMatchId: string,
    userId: string,
    clerkUserId?: string,
  ): Promise<void> {
    const playerIdentifier = clerkUserId || userId;

    try {
      const match = await this.arenaMatchRepository.findById(arenaMatchId);
      if (!match) return; // If match doesn't exist, we can't validate (or shouldn't block)

      // 1. Fast Check: Redis (Source of Truth for live status)
      const room = await this.arenaRepository.getRoom(match.roomId);
      if (room && room.players[playerIdentifier]?.status === "SUBMITTED") {
        throw AppError.from(ERRORS.ARENA.ALREADY_SUBMITTED);
      }

      // 2. Safety Check: Mongo (Permanent Record)
      const currentPlayer = match.players.find(
        (p: any) => p.userId === playerIdentifier,
      );
      if (currentPlayer && currentPlayer.verdict !== "NOT_SUBMITTED") {
        throw AppError.from(ERRORS.ARENA.ALREADY_SUBMITTED);
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      
      this.logger.error(
        { arenaMatchId, userId, err },
        "Failed to perform match submission validation",
      );
    }
  }

  /**
   * Ensures that a submission belongs to the requested user.
   * Prevents leaking private submission data across user accounts.
   */
  async validateSubmissionOwnership(submission: any, userId: string): Promise<void> {
    if (!submission) {
      throw AppError.from(ERRORS.SUBMISSION.NOT_FOUND);
    }

    if (submission.userId !== userId) {
      this.logger.warn({ submissionId: submission.id, userId }, "Unauthorized submission access attempt.");
      throw AppError.from(ERRORS.SUBMISSION.ACCESS_DENIED);
    }
  }
}
