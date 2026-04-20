import { createLogger } from '../libs/logger'
import type { Context, Next } from 'hono'
import { redis } from '../libs/redis'
import { AppError } from '../utils/app-error'
import type { AuthContext } from '../types/auth'

const logger = createLogger('rate-limit-middleware')

interface RateLimitOptions {
  windowMs: number
  max: number
  keyPrefix: string
}

/**
 * Sliding Window Rate Limiter using Redis Sorted Sets.
 * This provides precise rate limiting by tracking individual request timestamps.
 * Uses a Lua script for atomicity.
 */
export const rateLimit = (options: RateLimitOptions) => {
  const { windowMs, max, keyPrefix } = options

  // Lua script for atomic sliding window rate limiting
  // KEYS[1]: The rate limit key (e.g., rl:submit:user_123)
  // ARGV[1]: Current timestamp (ms)
  // ARGV[2]: Window size (ms)
  // ARGV[3]: Max requests allowed in window
  const slidingWindowScript = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local limit = tonumber(ARGV[3])
    
    local clearBefore = now - window
    
    -- 1. Remove timestamps outside the current window
    redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
    
    -- 2. Count requests in the current window
    local currentCount = redis.call('ZCARD', key)
    
    if currentCount < limit then
      -- 3. Add current request timestamp
      redis.call('ZADD', key, now, now)
      -- 4. Refresh TTL for the entire set
      redis.call('PEXPIRE', key, window)
      return {currentCount + 1, 0} -- Success: count, retryAfter (0)
    else
      -- 5. Limit exceeded: find when the oldest request expires to suggest Retry-After
      local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
      local retryAfter = 0
      if oldest[2] then
        retryAfter = math.ceil((tonumber(oldest[2]) + window - now) / 1000)
      end
      return {currentCount, retryAfter} -- Failure: count, retryAfter
    end
  `

  return async (c: Context, next: Next) => {
    const auth = c.get('auth') as AuthContext | undefined
    const identifier = auth?.user?.id || c.req.header('x-forwarded-for') || 'anonymous'
    
    const key = `${keyPrefix}:${identifier}`
    const now = Date.now()

    try {
      // Execute atomic Lua script
      const result = (await (redis as any).eval(
        slidingWindowScript,
        1,
        key,
        now.toString(),
        windowMs.toString(),
        max.toString()
      )) as [number, number]

      const [count, retryAfter] = result

      // Add rate limit headers
      c.header('X-RateLimit-Limit', max.toString())
      c.header('X-RateLimit-Remaining', Math.max(0, max - count).toString())
      c.header('X-RateLimit-Reset', new Date(now + windowMs).toISOString())

      if (count > max) {
        c.header('Retry-After', retryAfter.toString())
        logger.warn({ identifier, key, count, max }, 'Rate limit exceeded (sliding window)')
        throw AppError.tooManyRequests(`Too many requests. Please try again in ${retryAfter} seconds.`)
      }
    } catch (err) {
      if (err instanceof AppError) throw err
      
      logger.error({ identifier, key, err }, 'Rate limit Redis error (failing open)')
      // On Redis failure, we fail open (allow request) to avoid blocking users during infra issues
    }

    await next()
  }
}
