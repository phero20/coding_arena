import type { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createProblemSchema } from "../validators/problem.validator";
import type { ProblemController } from "../controllers/problem.controller";
import type { AppEnv } from "../types/hono.types";
import type { AuthMiddleware } from "../middlewares/auth.middleware";
import type { AuthorizationMiddleware } from "../middlewares/authorization.middleware";

export interface ProblemRoutesDeps {
  problemController: ProblemController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerProblemRoutes = (app: Hono<AppEnv>, deps: ProblemRoutesDeps) => {
  const { problemController, authMiddleware, authorizationMiddleware } = deps;

  app.get("/problems", (c) => problemController.getProblems(c));
  app.post(
    "/problems",
    authMiddleware.handle.bind(authMiddleware),
    authorizationMiddleware.requireRoles("admin"),
    zValidator("json", createProblemSchema),
    (c) => problemController.createProblem(c)
  );
  app.get("/problems/:slug", (c) => problemController.getProblemBySlug(c));
  app.get("/problems/id/:problem_id", (c) =>
    problemController.getProblemById(c),
  );
  app.get("/problems/topic/:topic", (c) =>
    problemController.getProblemsByTopic(c),
  );
};
