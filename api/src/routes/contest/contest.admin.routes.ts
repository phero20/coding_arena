import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { type ContestAdminController } from "../../controllers/contest/contest.admin.controller";
import { type AuthMiddleware } from "../../middlewares/security/auth.middleware";
import { type AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";
import {
  createContestSchema,
  updateContestSchema,
} from "../../validators/contest/contest.admin.validator";
import { UuidParamSchema } from "../../validators/common/common.validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";

export interface ContestAdminRouteDeps {
  contestAdminController: ContestAdminController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerContestAdminRoutes = (
  app: Hono<AppEnv>,
  deps: ContestAdminRouteDeps,
) => {
  const { contestAdminController, authMiddleware, authorizationMiddleware } = deps;
  const adminApp = new Hono<AppEnv>();

  // Ensure all routes require Auth and Admin role
  adminApp.use("*", authMiddleware.handle.bind(authMiddleware));
  adminApp.use("*", authorizationMiddleware.requireRoles("admin"));

  adminApp.get(
    "/stats",
    contestAdminController.action(contestAdminController.getStats.bind(contestAdminController))
  );

  adminApp.get(
    "/",
    contestAdminController.action(contestAdminController.getAllContests.bind(contestAdminController))
  );

  adminApp.post(
    "/",
    zValidator("json", createContestSchema),
    contestAdminController.action(contestAdminController.createContest.bind(contestAdminController), { status: 201 })
  );

  adminApp.post(
    "/sync",
    contestAdminController.action(contestAdminController.syncContests.bind(contestAdminController))
  );


  adminApp.put(
    "/:id",
    zValidator("param", UuidParamSchema),
    zValidator("json", updateContestSchema),
    contestAdminController.action(contestAdminController.updateContest.bind(contestAdminController))
  );

  adminApp.delete(
    "/:id",
    zValidator("param", UuidParamSchema),
    contestAdminController.action(contestAdminController.deleteContest.bind(contestAdminController))
  );

  app.route("/admin/contests", adminApp);
};
