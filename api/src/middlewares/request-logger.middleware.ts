import type { Context, Next } from 'hono'

export const requestLogger = async (c: Context, next: Next) => {
  const start = Date.now()
  const { method } = c.req
  const path = c.req.path

  await next()

  const durationMs = Date.now() - start
  const status = c.res.status

  // Keep logging simple for now; can be swapped with a structured logger later.
  // eslint-disable-next-line no-console
  console.log(
    `[request] ${method} ${path} -> ${status} (${durationMs}ms)`,
  )
}

