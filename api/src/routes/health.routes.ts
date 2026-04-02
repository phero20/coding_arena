import { Hono } from "hono";
import { mongoose } from "../mongo/connection";
import { redis } from "../libs/redis";
import { logger } from "../libs/logger";
import type { AppEnv } from "../types/hono.types";

const router = new Hono<AppEnv>();

/**
 * GET /health
 * Returns the status of critical backend dependencies.
 */
router.get("/", async (c) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "UP" : "DOWN";
  let redisStatus = "DOWN";

  try {
    const pong = await redis.ping();
    if (pong === "PONG") redisStatus = "UP";
  } catch (err) {
    logger.error(err, "Health check failed for Redis");
  }

  const isHealthy = mongoStatus === "UP" && redisStatus === "UP";

  return c.json(
    {
      status: isHealthy ? "HEALTHY" : "UNHEALTHY",
      checks: {
        mongodb: mongoStatus,
        redis: redisStatus,
      },
      timestamp: new Date().toISOString(),
    },
    isHealthy ? 200 : 503
  );
});

export const healthRoutes = router;
