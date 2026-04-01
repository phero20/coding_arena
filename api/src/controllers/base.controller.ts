import type { Context } from 'hono'
import { ApiResponse } from '../utils/api-response'
import { AppError } from '../utils/app-error'
import type { AppEnv, ValidatedContext } from '../types/hono.types'

/**
 * BaseController provides common utility methods to reduce boilerplate
 * in API controllers. It centralizes authentication extraction, JSON
 * parsing, and response formatting.
 */
export abstract class BaseController {
  
  /**
   * Safely extracts the authentication context.
   * Throws AppError.unauthorized if the auth context is missing.
   */
  protected getAuth(c: Context<AppEnv>) {
    const auth = c.get('auth')
    if (!auth) throw AppError.unauthorized()
    return auth
  }

  /**
   * Extracts the pre-validated JSON body from the request.
   */
  protected getBody<T>(c: Context<any, any, ValidatedContext<T>>): T {
    return c.req.valid('json')
  }

  /**
   * Returns a standard 200 OK success response.
   */
  protected ok(c: Context, data: any) {
    return c.json(ApiResponse.success(data).toJSON())
  }

  /**
   * Returns a standard 201 Created success response.
   */
  protected created(c: Context, data: any) {
    return c.json(ApiResponse.success(data).toJSON(), 201)
  }
}
