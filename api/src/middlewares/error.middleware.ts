import type { Context, Next } from 'hono'
import { AppError } from '../utils/app-error'
import { ApiResponse } from '../utils/api-response'

export const errorMiddleware = async (c: Context, next: Next) => {
  try {
    await next()
  } catch (err) {
    let appError: AppError

    if (err instanceof AppError) {
      appError = err
    } else if (err instanceof Error) {
      appError = AppError.internal(err.message, undefined, err)
    } else {
      appError = AppError.internal('Unexpected error', err, undefined)
    }

    // Basic logging for now; can be replaced with a proper logger
    // eslint-disable-next-line no-console
    console.error(appError)

    const response = ApiResponse.failure(appError.code, appError.message, appError.details)

    return c.json(response.toJSON(), appError.statusCode as any)
  }
}

