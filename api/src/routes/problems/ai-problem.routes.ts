import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { importedProblemSchema } from "../../validators/problems/ai-problem.validator";
import type { AiProblemController } from "../../controllers/problems/ai-problem.controller";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";
import type { AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";

export interface AiProblemRoutesDeps {
  aiProblemController: AiProblemController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerAiProblemRoutes = (
  app: Hono<AppEnv>,
  deps: AiProblemRoutesDeps,
) => {
  const { aiProblemController, authMiddleware, authorizationMiddleware } = deps;
  const aiRouter = new Hono<AppEnv>();

  // Secure all AI routes with Auth and Admin role
  aiRouter.use("*", authMiddleware.handle.bind(authMiddleware));
  aiRouter.use("*", authorizationMiddleware.requireRoles("admin"));

  // POST /ai/import
  aiRouter.post("/import", zValidator("json", importedProblemSchema), (c) =>
    aiProblemController.import(c),
  );

  aiRouter.post("/problems/:problemId/generate", (c) =>
    aiProblemController.generateAiSolution(c),
  );

  aiRouter.post("/problems/:problemId/testcases", (c) =>
    aiProblemController.generateTestcases(c),
  );

  app.route("/ai", aiRouter);
};
