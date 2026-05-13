import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createSolutionSchema, voteSolutionSchema } from "../../validators/solution.validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import type { SolutionController } from "../../controllers/solutions/solution.controller";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";

export const registerSolutionRoutes = (
  app: Hono<AppEnv>,
  {
    solutionController,
    authMiddleware,
  }: {
    solutionController: SolutionController;
    authMiddleware: AuthMiddleware;
  },
) => {
  const problemSolutions = new Hono<AppEnv>();
  const solutions = new Hono<AppEnv>();

  // POST /problems/:id/solutions
  problemSolutions.post(
    "/:id/solutions",
    authMiddleware.handle.bind(authMiddleware),
    zValidator("json", createSolutionSchema),
    solutionController.action(solutionController.createSolution, { status: 201 })
  );

  // GET /problems/:id/solutions
  problemSolutions.get(
    "/:id/solutions",
    solutionController.action(solutionController.getSolutionsForProblem, { requireAuth: false })
  );

  // POST /solutions/:id/vote
  solutions.post(
    "/:id/vote",
    authMiddleware.handle.bind(authMiddleware),
    zValidator("json", voteSolutionSchema),
    solutionController.action(solutionController.voteForSolution)
  );

  // PATCH /solutions/:id
  solutions.patch(
    "/:id",
    authMiddleware.handle.bind(authMiddleware),
    // Partial create schema for updates
    zValidator("json", createSolutionSchema.partial()),
    solutionController.action(solutionController.updateSolution)
  );

  // DELETE /solutions/:id
  solutions.delete(
    "/:id",
    authMiddleware.handle.bind(authMiddleware),
    solutionController.action(solutionController.deleteSolution)
  );
  
  // GET /solutions/user/:userId
  solutions.get(
    "/user/:userId",
    solutionController.action(solutionController.getSolutionsByUser, { requireAuth: false })
  );

  app.route("/problems", problemSolutions);
  app.route("/solutions", solutions);
};
