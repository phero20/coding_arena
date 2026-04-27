import type { Hono } from "hono";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";
import type { AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";
import type { AuthController } from "../../controllers/auth/auth.controller";
import type { ClerkWebhookController } from "../../controllers/auth/clerk-webhook.controller";
import type { AppEnv } from "../../types/infrastructure/hono.types";

export interface AuthRoutesDeps {
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
  authController: AuthController;
  clerkWebhookController: ClerkWebhookController;
}

export const registerAuthRoutes = (app: Hono<AppEnv>, deps: AuthRoutesDeps) => {
  const {
    authMiddleware,
    authorizationMiddleware,
    authController,
    clerkWebhookController,
  } = deps;

  app.get(
    "/me",
    authMiddleware.handle.bind(authMiddleware),
    authorizationMiddleware.requireRoles("user", "admin"),
    (c) => authController.me(c),
  );

  app.post("/webhooks/clerk", (c) => clerkWebhookController.handle(c));
};
