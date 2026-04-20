import type { Context, Next } from "hono";
import { clerkClient, verifyToken } from "../../libs/security/clerk";

import type { AuthService } from "../../services/auth/auth.service";
import { AppError } from "../../utils/app-error";
import { ERRORS } from "../../constants/errors";
import type { AuthContext } from "../../types/auth/auth";
import { config } from "../../configs/env";

import { type ICradle } from "../../libs/awilix-container";

export class AuthMiddleware {
  private readonly authService: AuthService;

  constructor({ authService }: ICradle) {
    this.authService = authService;
  }

  async handle(c: Context, next: Next) {
    const authHeader = c.req.header("authorization");

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      throw AppError.from(ERRORS.AUTH.MISSING_TOKEN);
    }

    const token = authHeader.slice("bearer ".length).trim();
    if (!token) {
      throw AppError.from(ERRORS.AUTH.MISSING_BEARER);
    }

    let payload;
    try {
      payload = await verifyToken(token, {
        secretKey: config.clerkSecretKey,
        audience: config.clerkJwtAudience,
        authorizedParties: config.clerkAuthorizedParties,
      });
    } catch (err) {
      throw AppError.from(ERRORS.AUTH.INVALID_TOKEN, err);
    }

    const clerkId = payload.sub as string;

    // 1. Check local database first (Optimized)
    let user = await this.authService.ensureUserFromIdOnly(clerkId);

    // 2. Fallback to Clerk API only if user not in DB
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
      const username =
        clerkUser.username || (email ? email.split("@")[0] : `user_${clerkId}`);

      user = await this.authService.ensureUser({
        clerkId,
        username,
        email,
        avatarUrl: clerkUser.imageUrl,
      });
    }

    const authContext: AuthContext = {
      user,
      clerkUserId: clerkId,
      sessionId: (payload.sid as string | undefined) ?? undefined,
    };

    c.set("auth", authContext);

    await next();
  }
}
