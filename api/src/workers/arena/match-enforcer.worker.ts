import { container } from "../../libs/awilix-container";
import { createLogger } from "../../libs/utils/logger";
import { registerShutdownHandler } from "../../libs/core/resilience";

const { arenaRepository, arenaMatchService, clockService } = container.cradle;
const logger = createLogger("match-enforcer");

// Run every 10 seconds
const ENFORCER_INTERVAL_MS = 10000;
let intervalId: any;

/**
 * [MatchEnforcer] - Resource-safe Match Timer Heartbeat Scanner.
 * Refactored for robust lifecycle management and zero-leak graceful shutdowns.
 */
export function startMatchEnforcer() {
  if (intervalId) {
    logger.warn(
      "[Enforcer] Scanner is already running. Skipping duplicate initialization.",
    );
    return;
  }

  logger.info(
    `[Enforcer] Initializing Match Timer Heartbeat Scanner (Interval: ${ENFORCER_INTERVAL_MS}ms)`,
  );

  intervalId = setInterval(async () => {
    try {
      const activeRooms = await arenaRepository.getAllPlayingRooms();
      const now = clockService.now();

      let expiredCount = 0;

      for (const room of activeRooms) {
        if (room.endTime && now >= room.endTime) {
          logger.info(
            `[Enforcer] Match ${room.roomId} deadline reached. Terminating process.`,
          );
          await arenaMatchService.forceFinishMatch(room.roomId);
          expiredCount++;
        }
      }

      if (expiredCount > 0) {
        logger.info(
          `[Enforcer] Sweeper task completed: ${expiredCount} expired room(s) neutralized.`,
        );
      }
    } catch (err) {
      logger.error({ err }, "[Enforcer] Critical failure during scan cycle.");
    }
  }, ENFORCER_INTERVAL_MS);
}

/**
 * [Shutdown Registry] - Explicitly clears heartbeats to drain the process safely.
 */
registerShutdownHandler("match-enforcer", () => {
  if (intervalId) {
    logger.info(
      "[Enforcer] Graceful shutdown initiated. Clearing Heartbeat interval...",
    );
    clearInterval(intervalId);
    intervalId = undefined;
    logger.info("[Enforcer] Stop confirmed. Scanner resources released.");
  }
});
