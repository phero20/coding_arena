import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createAdminProblemSchema,
  updateAdminProblemSchema,
  updateProblemTestsSchema,
} from "../../validators/problems/problem.admin.validator";
import { PaginationQuerySchema } from "../../validators/common/common.validator";
import type { ProblemAdminController } from "../../controllers/problems/problem.admin.controller";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";
import type { AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";
import { z } from "zod";

const problemSearchQuerySchema = PaginationQuerySchema.extend({
  search: z.string().optional(),
});

export interface ProblemAdminRoutesDeps {
  problemAdminController: ProblemAdminController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerProblemAdminRoutes = (
  app: Hono<AppEnv>,
  deps: ProblemAdminRoutesDeps,
) => {
  const { problemAdminController, authMiddleware, authorizationMiddleware } =
    deps;

  const adminRouter = new Hono<AppEnv>();

  // Ensure all routes require admin auth
  adminRouter.use("*", authMiddleware.handle.bind(authMiddleware));
  adminRouter.use("*", authorizationMiddleware.requireRoles("admin"));

  adminRouter.get(
    "/",
    zValidator("query", problemSearchQuerySchema),
    problemAdminController.action(problemAdminController.getAllPaginated),
  );

  adminRouter.post(
    "/",
    zValidator("json", createAdminProblemSchema),
    problemAdminController.action(problemAdminController.createProblem, {
      status: 201,
    }),
  );

  adminRouter.put(
    "/:id",
    zValidator("json", updateAdminProblemSchema),
    problemAdminController.action(problemAdminController.updateProblem),
  );

  adminRouter.delete(
    "/:id",
    problemAdminController.action(problemAdminController.deleteProblem),
  );

  adminRouter.get(
    "/:id",
    problemAdminController.action(problemAdminController.getProblemById),
  );

  adminRouter.get(
    "/:id/tests",
    problemAdminController.action(problemAdminController.getProblemTests),
  );

  adminRouter.put(
    "/:id/tests",
    zValidator("json", updateProblemTestsSchema),
    problemAdminController.action(problemAdminController.updateProblemTests),
  );

  app.route("/admin/problems", adminRouter);
};
