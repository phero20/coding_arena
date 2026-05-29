import { Hono } from "hono";
import { mongoose } from "../../mongo/connection";
<<<<<<< HEAD
import { redis } from "../../libs/core/redis";
import { logger } from "../../libs/utils/logger";
=======
import { redis, getRedisPoolMetrics } from "../../libs/core/redis";
import { logger } from "../../libs/utils/logger";
import { submissionQueue, arenaCleanupQueue, contestSyncQueue } from "../../libs/core/queue";
>>>>>>> prod-deploy
import type { AppEnv } from "../../types/infrastructure/hono.types";

const router = new Hono<AppEnv>();

/**
 * GET /health
 * Returns the status of critical backend dependencies.
 */
router.get("/", async (c) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "UP" : "DOWN";
  let redisStatus = "DOWN";
<<<<<<< HEAD

  try {
    const pong = await redis.ping();
    if (pong === "PONG") redisStatus = "UP";
=======
  let redisPoolMetrics = null;

  try {
    const pong = await redis.ping();
    if (pong === "PONG") {
      redisStatus = "UP";
      redisPoolMetrics = getRedisPoolMetrics();
    }
>>>>>>> prod-deploy
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
<<<<<<< HEAD
=======
      ...(redisPoolMetrics && { redisPool: redisPoolMetrics }),
    },
    isHealthy ? 200 : 503,
  );
});

/**
 * GET /health/detailed
 * Returns detailed metrics about queues, connections, and system health.
 * Used for monitoring and debugging cluster configuration.
 */
router.get("/detailed", async (c) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "UP" : "DOWN";
  let redisStatus = "DOWN";
  let redisPoolMetrics = null;
  let queueMetrics = null;

  try {
    const pong = await redis.ping();
    if (pong === "PONG") {
      redisStatus = "UP";
      redisPoolMetrics = getRedisPoolMetrics();
      
      // Get queue metrics
      const [submissionCount, cleanupCount, contestCount] = await Promise.all([
        submissionQueue.count(),
        arenaCleanupQueue.count(),
        contestSyncQueue.count(),
      ]);
      
      queueMetrics = {
        submission: {
          pending: submissionCount,
          workers: 10, // From config.ts
        },
        arenaCleanup: {
          pending: cleanupCount,
          workers: 1,
        },
        contestSync: {
          pending: contestCount,
          workers: 1,
        },
      };
    }
  } catch (err) {
    logger.error(err, "Health check failed");
  }

  const isHealthy = mongoStatus === "UP" && redisStatus === "UP";
  const memUsage = process.memoryUsage();

  return c.json(
    {
      status: isHealthy ? "HEALTHY" : "UNHEALTHY",
      timestamp: new Date().toISOString(),
      dependencies: {
        mongodb: mongoStatus,
        redis: redisStatus,
      },
      ...(redisPoolMetrics && { redisPool: redisPoolMetrics }),
      ...(queueMetrics && { queues: queueMetrics }),
      system: {
        memory: {
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + "MB",
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + "MB",
          rss: Math.round(memUsage.rss / 1024 / 1024) + "MB",
        },
        uptime: Math.floor(process.uptime()) + "s",
        nodeVersion: process.version,
      },
>>>>>>> prod-deploy
    },
    isHealthy ? 200 : 503,
  );
});

export const healthRoutes = router;
