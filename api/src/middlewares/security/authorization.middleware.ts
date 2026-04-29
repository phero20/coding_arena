import type { Context, Next } from 'hono';
import type { AuthContext } from '../../types/auth/auth';
import { AppError } from '../../utils/app-error';
import { type ICradle } from '../../libs/awilix-container';

/**
 * Middleware for handling role-based access control.
 * Ensures that the user is authenticated and possesses the required roles.
 */
export class AuthorizationMiddleware {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_: ICradle) {}
  
  /**
   * Guards a route by checking if the authenticated user has any of the required roles.
   * Throws 401 if not authenticated, 403 if roles don't match.
   */
  requireRoles(...roles: string[]) {
    return async (c: Context, next: Next) => {
      const auth = c.get('auth') as AuthContext | undefined;

      if (!auth) {
        throw AppError.unauthorized('Authentication required to access this resource');
      }

      if (!roles.includes(auth.user.role)) {
        throw AppError.forbidden('Insufficient permissions', {
          requiredRoles: roles,
          userRole: auth.user.role,
        });
      }

      await next();
    };
  }
}
