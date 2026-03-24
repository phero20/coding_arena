import type { Hono } from "hono";
import type { ProblemController } from "../controllers/problem.controller";

export interface ProblemRoutesDeps {
  problemController: ProblemController;
}

export const registerProblemRoutes = (app: Hono, deps: ProblemRoutesDeps) => {
  const { problemController } = deps;

  app.get("/problems", (c) => problemController.getProblems(c));
  app.post("/problems", (c) => problemController.createProblem(c));
  app.get("/problems/:slug", (c) => problemController.getProblemBySlug(c));
  app.get("/problems/id/:problem_id", (c) =>
    problemController.getProblemById(c),
  );
  app.get("/problems/topic/:topic", (c) =>
    problemController.getProblemsByTopic(c),
  );
};
