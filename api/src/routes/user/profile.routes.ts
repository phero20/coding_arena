import { Hono } from "hono";
import { type ProfileController } from "../../controllers/user/profile.controller";
import { type AuthMiddleware } from "../../middlewares/security/auth.middleware";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import { zValidator } from "@hono/zod-validator";
import { updateProfileSchema } from "../../controllers/user/profile.controller";

export interface ProfileRouteDependencies {
  profileController: ProfileController;
  authMiddleware: AuthMiddleware;
}

export const registerProfileRoutes = (
  app: Hono<AppEnv>,
  deps: ProfileRouteDependencies,
) => {
  const { profileController, authMiddleware } = deps;

  /**
   * PATCH /users/profile
   * Updates user profile fields such as social links.
   */
  app.patch(
    "/users/profile",
    (c, next) => authMiddleware.handle(c, next),
    zValidator("json", updateProfileSchema),
    profileController.action(profileController.updateProfile),
  );
};
