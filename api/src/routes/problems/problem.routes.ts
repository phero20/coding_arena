import type { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createProblemSchema } from "../../validators/problems/problem.validator";
import {
  SlugParamSchema,
  ProblemIdUnderscoreParamSchema,
  PaginationQuerySchema,
} from "../../validators/common/common.validator";
import type { ProblemController } from "../../controllers/problems/problem.controller";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";
import type { AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";

export interface ProblemRoutesDeps {
  problemController: ProblemController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerProblemRoutes = (
  app: Hono<AppEnv>,
  deps: ProblemRoutesDeps,
) => {
  const { problemController, authMiddleware, authorizationMiddleware } = deps;

  // Controllers now use context-free handlers via the .action() adapter

  // Public problem list access
  app.get(
    "/problems",
    problemController.action(problemController.getProblems, {
      requireAuth: false,
    }),
  );

  app.post(
    "/problems",
    authMiddleware.handle.bind(authMiddleware),
    authorizationMiddleware.requireRoles("admin"),
    zValidator("json", createProblemSchema),
    problemController.action(problemController.createProblem, { status: 201 }),
  );

  // Public individual problem access
  app.get(
    "/problems/:slug",
    zValidator("param", SlugParamSchema),
    problemController.action(problemController.getProblemBySlug, {
      requireAuth: false,
    }),
  );

  app.get(
    "/problems/id/:problem_id",
    zValidator("param", ProblemIdUnderscoreParamSchema),
    problemController.action(problemController.getProblemById, {
      requireAuth: false,
    }),
  );

  app.get(
    "/problems/topic/:topic",
    zValidator("query", PaginationQuerySchema),
    problemController.action(problemController.getProblemsByTopic, {
      requireAuth: false,
    }),
  );
};
