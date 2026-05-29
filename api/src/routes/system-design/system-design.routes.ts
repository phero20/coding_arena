import { Hono } from "hono";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import { type SystemDesignController } from "../../controllers/system-design/system-design.controller";

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

  app.route("/system-design", systemDesignApp);
};
