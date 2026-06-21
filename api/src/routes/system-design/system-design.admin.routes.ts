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
import { z } from "zod";

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
    "/stats",
    systemDesignAdminController.action(systemDesignAdminController.getStats.bind(systemDesignAdminController))
  );

  adminApp.get(
    "/workspaces/user/:userId",
    zValidator("param", z.object({ userId: z.string().uuid() })),
    systemDesignAdminController.action(systemDesignAdminController.getWorkspacesByUserId.bind(systemDesignAdminController))
  );

  adminApp.get(
    "/diagrams/user/:userId",
    zValidator("param", z.object({ userId: z.string().uuid() })),
    systemDesignAdminController.action(systemDesignAdminController.getDiagramsByUserId.bind(systemDesignAdminController))
  );

  adminApp.delete(
    "/workspaces/:id",
    zValidator("param", z.object({ id: z.string().uuid() })),
    systemDesignAdminController.action(systemDesignAdminController.deleteWorkspace.bind(systemDesignAdminController))
  );

  adminApp.delete(
    "/diagrams/:id",
    zValidator("param", z.object({ id: z.string().uuid() })),
    systemDesignAdminController.action(systemDesignAdminController.deleteDiagram.bind(systemDesignAdminController))
  );

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
