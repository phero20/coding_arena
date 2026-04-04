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
 * Basic fixed-window rate limiter using Redis.
 */
export const rateLimit = (options: RateLimitOptions) => {
  return async (c: Context, next: Next) => {
    const auth = c.get('auth') as AuthContext | undefined
    const userId = auth?.user?.id || c.req.header('x-forwarded-for') || 'anonymous'
    
    const key = `${options.keyPrefix}:${userId}`

    const ttlSeconds = Math.floor(options.windowMs / 1000)

    try {
      // Atomically create the key with TTL only if it doesn't exist.
      // This guarantees the TTL is always set — crash-safe.
      await redis.set(key, 0, 'EX', ttlSeconds, 'NX')
      const count = await redis.incr(key)

      if (count > options.max) {
        throw AppError.tooManyRequests(`Too many requests. Please try again in ${ttlSeconds} seconds.`)
      }

      // Add rate limit headers
      c.header('X-RateLimit-Limit', options.max.toString())
      c.header('X-RateLimit-Remaining', Math.max(0, options.max - count).toString())
    } catch (err) {
      if (err instanceof AppError) throw err
      
      logger.error({ userId, key, err }, 'Rate limit Redis error (failing open)')
      // On Redis failure, we fail open (allow request) to prevent blocking users
    }

    await next()
  }
}
