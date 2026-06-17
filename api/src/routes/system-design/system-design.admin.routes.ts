import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { type SystemDesignAdminController } from "../../controllers/system-design/system-design.admin.controller";
import { type AuthMiddleware } from "../../middlewares/security/auth.middleware";
import { type AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";
import {
  createSystemDesignTopicSchema,
  updateSystemDesignTopicSchema,
  bulkReorderSystemDesignTopicsSchema,
} from "../../validators/system-design/system-design.admin.validator";
import { IdParamSchema } from "../../validators/common/common.validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";

export interface SystemDesignAdminRouteDeps {
  systemDesignAdminController: SystemDesignAdminController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerSystemDesignAdminRoutes = (
  app: Hono<AppEnv>,
  deps: SystemDesignAdminRouteDeps,
) => {
  const { systemDesignAdminController, authMiddleware, authorizationMiddleware } = deps;
  const adminApp = new Hono<AppEnv>();

  // Ensure all routes require Auth and Admin role
  adminApp.use("*", authMiddleware.handle.bind(authMiddleware));
  adminApp.use("*", authorizationMiddleware.requireRoles("admin"));

  adminApp.get(
    "",
    systemDesignAdminController.action(systemDesignAdminController.getAllTopics.bind(systemDesignAdminController))
  );

  adminApp.post(
    "",
    zValidator("json", createSystemDesignTopicSchema),
    systemDesignAdminController.action(systemDesignAdminController.createTopic.bind(systemDesignAdminController), { status: 201 })
  );

  adminApp.post(
    "/reorder",
    zValidator("json", bulkReorderSystemDesignTopicsSchema),
    systemDesignAdminController.action(systemDesignAdminController.bulkReorderTopics.bind(systemDesignAdminController))
  );

  adminApp.put(
    "/:id",
    zValidator("param", IdParamSchema),
    zValidator("json", updateSystemDesignTopicSchema),
    systemDesignAdminController.action(systemDesignAdminController.updateTopic.bind(systemDesignAdminController))
  );

  adminApp.delete(
    "/:id",
    zValidator("param", IdParamSchema),
    systemDesignAdminController.action(systemDesignAdminController.deleteTopic.bind(systemDesignAdminController))
  );

  app.route("/admin/system-design", adminApp);
};
