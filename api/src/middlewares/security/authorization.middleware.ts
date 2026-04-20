import type { Context, Next } from "hono";
import type { AuthContext } from "../../types/auth/auth";
import { AppError } from "../../utils/app-error";

import { type ICradle } from "../../libs/awilix-container";

export class AuthorizationMiddleware {
  constructor(_: ICradle) {}
  requireRoles(...roles: string[]) {
    return async (c: Context, next: Next) => {
      const auth = c.get("auth") as AuthContext;

      if (!roles.includes(auth.user.role)) {
        throw AppError.forbidden("Insufficient permissions", {
          requiredRoles: roles,
          userRole: auth.user.role,
        });
      }

      await next();
    };
  }
}
