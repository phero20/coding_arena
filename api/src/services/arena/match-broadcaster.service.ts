import * as arenaRedis from "../../libs/core/arena-redis";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("match-broadcaster");

/**
 * MatchBroadcasterService (Real-time Messaging)
 *
 * This service encapsulates all PubSub and WebSocket communication.
 * It ensures that the core domain logic doesn't need to know about JSON.stringify,
 * channel names, or event types.
 */
export class MatchBroadcasterService {
  /**
   * Notifies the Go Hub to recalculate the leaderboard.
   */
  async notifyLeaderboardUpdate(roomId: string): Promise<void> {
    try {
      await arenaRedis.publishArenaUpdate(roomId, {
        type: "LEADERBOARD_UPDATE",
        roomId,
      });
    } catch (err) {
      logger.error({ roomId, err }, "Failed to broadcast LEADERBOARD_UPDATE.");
    }
  }

  /**
   * Broadcasts the final match results and ranking.
   */
  async broadcastMatchOver(
    roomId: string,
    matchId: string,
    finalRankings: any[],
  ): Promise<void> {
    try {
      await arenaRedis.publishArenaUpdate(roomId, {
        type: "MATCH_OVER",
        roomId,
        payload: {
          finalRankings,
          matchId,
        },
      });
    } catch (err) {
      logger.error({ roomId, err }, "Failed to broadcast MATCH_OVER.");
    }
  }

  /**
   * Notifies players that a specific user has submitted.
   */
  async notifyPlayerSubmission(
    roomId: string,
    userId: string,
    submissionId: string,
  ): Promise<void> {
    try {
      await arenaRedis.publishPlayerSubmitted(roomId, userId, 0, submissionId);
    } catch (err) {
      logger.error(
        { roomId, userId, err },
        "Failed to broadcast PLAYER_SUBMITTED.",
      );
    }
  }

  /**
   * Broadcasts any custom payload to the match room.
   */
  async broadcastUpdate(roomId: string, payload: any): Promise<void> {
    try {
      await arenaRedis.publishArenaUpdate(roomId, payload);
    } catch (err) {
      logger.error({ roomId, err }, "Failed to broadcast update.");
    }
  }
}
