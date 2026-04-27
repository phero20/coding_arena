import type { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { upsertTestsSchema } from "../../validators/problems/problem-test.validator";
import type { ProblemTestController } from "../../controllers/problems/problem-test.controller";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";
import type { AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";

export interface ProblemTestRoutesDeps {
  problemTestController: ProblemTestController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerProblemTestRoutes = (
  app: Hono<AppEnv>,
  deps: ProblemTestRoutesDeps,
) => {
  const { problemTestController, authMiddleware, authorizationMiddleware } =
    deps;

  app.post(
    "/problems/:problem_id/tests",
    authMiddleware.handle.bind(authMiddleware),
    authorizationMiddleware.requireRoles("admin"),
    zValidator("json", upsertTestsSchema),
    (c) => problemTestController.upsertTests(c),
  );

  app.get("/problems/:problem_id/tests", (c) =>
    problemTestController.getTestsForProblem(c),
  );

  app.get("/problems/:problem_id/tests/:type", (c) =>
    problemTestController.getTestsForProblemAndType(c),
  );
};
