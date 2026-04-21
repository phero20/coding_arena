import type { Context, Next } from 'hono'
import { logger } from '../libs/logger'

export const requestLogger = async (c: Context, next: Next) => {
  const start = Date.now()
  const { method } = c.req
  const path = c.req.path
  const traceId = c.get('requestId')

  await next()

  const durationMs = Date.now() - start
  const status = c.res.status

  logger.info(
    { 
      type: 'request', 
      method, 
      path, 
      status, 
      durationMs,
      traceId 
    },
    `${method} ${path} -> ${status} (${durationMs}ms)`,
  )
}

