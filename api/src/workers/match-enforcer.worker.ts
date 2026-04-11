import { arenaRepository } from "../libs/containers/repo.container";
import { arenaService } from "../libs/containers/service.container";
import { createLogger } from "../libs/logger";

const logger = createLogger("match-enforcer");

// Run every 10 seconds
const ENFORCER_INTERVAL_MS = 10000;

export function startMatchEnforcer() {
  logger.info(`[Enforcer] Starting Match Timer Heartbeat Scanner (Interval: ${ENFORCER_INTERVAL_MS}ms)`);
  
  setInterval(async () => {
    try {
      const activeRooms = await arenaRepository.getAllPlayingRooms();
      const now = Date.now();
      
      let expiredCount = 0;

      for (const room of activeRooms) {
        if (room.endTime && now >= room.endTime) {
          logger.info(`[Enforcer] Match ${room.roomId} has passed exactly ${now - room.endTime}ms past deadline. Terminating.`);
          await arenaService.forceFinishMatch(room.roomId);
          expiredCount++;
        }
      }

      if (expiredCount > 0) {
        logger.info(`[Enforcer] Successfully hard-killed ${expiredCount} expired match(es).`);
      }
    } catch (err) {
      logger.error({ err }, "[Enforcer] Failed to execute sweep");
    }
  }, ENFORCER_INTERVAL_MS);
}
