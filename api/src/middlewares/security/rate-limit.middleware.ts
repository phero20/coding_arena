import { createLogger } from "../../libs/utils/logger";
import type { Context, Next } from "hono";
import { redis } from "../../libs/core/redis";
import { AppError } from "../../utils/app-error";
import type { AuthContext } from "../../types/auth/auth";
import { type IClockService } from "../../services/common/clock.service";
import { type ICradle } from "../../libs/awilix-container";

const logger = createLogger("rate-limit-middleware");

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix: string;
}

/**
 * Sliding Window Rate Limiter using Redis Sorted Sets.
 * Refactored to use DI and the mockable ClockService.
 */
export class RateLimitMiddleware {
  private readonly clock: IClockService;

  constructor({ clockService }: ICradle) {
    this.clock = clockService;
  }

  /**
   * Returns a Hono middleware configured with the given options.
   */
  limit(options: RateLimitOptions) {
    const { windowMs, max, keyPrefix } = options;

    const slidingWindowScript = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])
      local limit = tonumber(ARGV[3])
      
      local clearBefore = now - window
      
      redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
      local currentCount = redis.call('ZCARD', key)
      
      if currentCount < limit then
        redis.call('ZADD', key, now, now)
        redis.call('PEXPIRE', key, window)
        return {currentCount + 1, 0}
      else
        local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
        local retryAfter = 0
        if oldest[2] then
          retryAfter = math.ceil((tonumber(oldest[2]) + window - now) / 1000)
        end
        return {currentCount, retryAfter}
      end
    `;

    return async (c: Context, next: Next) => {
      const auth = c.get("auth") as AuthContext | undefined;
      const identifier =
        auth?.user?.id || c.req.header("x-forwarded-for") || "anonymous";

      const key = `${keyPrefix}:${identifier}`;
      const now = this.clock.now();

      try {
        const result = (await (redis as any).eval(
          slidingWindowScript,
          1,
          key,
          now.toString(),
          windowMs.toString(),
          max.toString(),
        )) as [number, number];

        const [count, retryAfter] = result;

        c.header("X-RateLimit-Limit", max.toString());
        c.header("X-RateLimit-Remaining", Math.max(0, max - count).toString());
        c.header("X-RateLimit-Reset", new Date(now + windowMs).toISOString());

        if (count > max) {
          c.header("Retry-After", retryAfter.toString());
          logger.warn(
            { identifier, key, count, max },
            "Rate limit exceeded (sliding window)",
          );
          throw AppError.tooManyRequests(
            `Too many requests. Please try again in ${retryAfter} seconds.`,
          );
        }
      } catch (err) {
        if (err instanceof AppError) throw err;
        logger.error(
          { identifier, key, err },
          "Rate limit Redis error (failing open)",
        );
      }

      await next();
    };
  }
}
