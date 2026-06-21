import { Hono } from "hono";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";
import type { AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";
import type { ArenaAdminController } from "../../controllers/arena/arena.admin.controller";

export interface ArenaAdminRoutesDeps {
  arenaAdminController: ArenaAdminController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerArenaAdminRoutes = (
  app: Hono<AppEnv>,
  deps: ArenaAdminRoutesDeps,
) => {
  const { arenaAdminController, authMiddleware, authorizationMiddleware } = deps;

  const adminRouter = new Hono<AppEnv>();

  // Ensure all routes require admin auth
  adminRouter.use("*", authMiddleware.handle.bind(authMiddleware));
  adminRouter.use("*", authorizationMiddleware.requireRoles("admin"));

  adminRouter.get(
    "/stats",
    arenaAdminController.action(arenaAdminController.getStats),
  );

  app.route("/admin/arena", adminRouter);
};
