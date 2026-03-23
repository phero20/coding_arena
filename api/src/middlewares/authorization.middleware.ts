import type { Context, Next } from 'hono'
import type { AuthContext } from '../types/auth'
import { AppError } from '../utils/app-error'

export class AuthorizationMiddleware {
  requireRoles(...roles: string[]) {
    return async (c: Context, next: Next) => {
      const auth = c.get('auth') as AuthContext

      if (!roles.includes(auth.user.role)) {
        throw AppError.forbidden('Insufficient permissions', {
          requiredRoles: roles,
          userRole: auth.user.role,
        })
      }

      await next()
    }
  }
}

