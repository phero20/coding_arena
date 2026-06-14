import { Hono } from "hono";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import { type SystemDesignController } from "../../controllers/system-design/system-design.controller";
import { zValidator } from "@hono/zod-validator";
import { createSystemDesignTopicSchema } from "../../validators/system-design.validator";

export interface SystemDesignRouteDependencies {
  systemDesignController: SystemDesignController;
}

export const registerSystemDesignRoutes = (
  app: Hono<AppEnv>,
  deps: SystemDesignRouteDependencies
) => {
  const { systemDesignController } = deps;
  const systemDesignApp = new Hono<AppEnv>();

  // GET /api/v1/system-design/topics
  systemDesignApp.get(
    "/topics",
    systemDesignController.action(systemDesignController.getTopics, { requireAuth: false })
  );

  // GET /api/v1/system-design/topics/:slug
  systemDesignApp.get(
    "/topics/:slug",
    systemDesignController.action(systemDesignController.getTopicContent, { requireAuth: false })
  );

  // POST /api/v1/system-design/topics
  systemDesignApp.post(
    "/topics",
    zValidator("json", createSystemDesignTopicSchema),
    systemDesignController.action(systemDesignController.createTopic, { requireAuth: false })
  );

  app.route("/system-design", systemDesignApp);
};
