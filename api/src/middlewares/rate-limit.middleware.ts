import type { Context, Next } from 'hono'
import { redis } from '../libs/redis'
import { AppError } from '../utils/app-error'
import type { AuthContext } from '../types/auth'

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

    try {
      const count = await redis.incr(key)
      
      if (count === 1) {
        // First request in this window, set expiration
        await redis.expire(key, options.windowMs / 1000)
      }

      if (count > options.max) {
        throw AppError.tooManyRequests(`Too many requests. Please try again in ${options.windowMs / 1000} seconds.`)
      }

      // Add rate limit headers
      c.header('X-RateLimit-Limit', options.max.toString())
      c.header('X-RateLimit-Remaining', Math.max(0, options.max - count).toString())
    } catch (err) {
      if (err instanceof AppError) throw err
      console.error('[RateLimit] Redis error:', err)
      // On Redis failure, we fail open (allow request) to prevent blocking users
    }

    await next()
  }
}
