import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { importedProblemSchema } from "../../validators/problems/ai-problem.validator";
import type { AiProblemController } from "../../controllers/problems/ai-problem.controller";
import type { AppEnv } from "../../types/infrastructure/hono.types";

export interface AiProblemRoutesDeps {
  aiProblemController: AiProblemController;
}

export const registerAiProblemRoutes = (
  app: Hono<AppEnv>,
  deps: AiProblemRoutesDeps,
) => {
  const { aiProblemController } = deps;

  // NOTE: This route is intentionally left unauthenticated for now.
  // Add auth and role-based checks before using in production.
  app.post("/ai/import", zValidator("json", importedProblemSchema), (c) =>
    aiProblemController.import(c),
  );
};
