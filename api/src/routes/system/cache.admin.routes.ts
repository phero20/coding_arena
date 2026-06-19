import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { type CacheAdminController } from "../../controllers/system/cache.admin.controller";
import { type AuthMiddleware } from "../../middlewares/security/auth.middleware";
import { type AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";
import {
  getCacheKeysSchema,
  cacheKeyParamSchema,
} from "../../validators/system/cache.admin.validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";

export interface CacheAdminRouteDeps {
  cacheAdminController: CacheAdminController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerCacheAdminRoutes = (
  app: Hono<AppEnv>,
  deps: CacheAdminRouteDeps,
) => {
  const { cacheAdminController, authMiddleware, authorizationMiddleware } = deps;
  const adminApp = new Hono<AppEnv>();

  // Ensure all routes require Auth and Admin role
  adminApp.use("*", authMiddleware.handle.bind(authMiddleware));
  adminApp.use("*", authorizationMiddleware.requireRoles("admin"));

  adminApp.get(
    "",
    zValidator("query", getCacheKeysSchema),
    cacheAdminController.action(cacheAdminController.getCacheKeys.bind(cacheAdminController))
  );

  adminApp.delete(
    "/flush",
    cacheAdminController.action(cacheAdminController.flushCache.bind(cacheAdminController))
  );

  adminApp.get(
    "/:key",
    zValidator("param", cacheKeyParamSchema),
    cacheAdminController.action(cacheAdminController.getKeyDetails.bind(cacheAdminController))
  );

  adminApp.delete(
    "/:key",
    zValidator("param", cacheKeyParamSchema),
    cacheAdminController.action(cacheAdminController.deleteKey.bind(cacheAdminController))
  );

  app.route("/admin/system/cache", adminApp);
};
