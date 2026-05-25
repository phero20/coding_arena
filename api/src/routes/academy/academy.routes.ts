import { Hono } from "hono";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import { type AcademyController } from "../../controllers/academy/academy.controller";

export interface AcademyRouteDependencies {
  academyController: AcademyController;
}

export const registerAcademyRoutes = (
  app: Hono<AppEnv>,
  deps: AcademyRouteDependencies
) => {
  const { academyController } = deps;
  const academyApp = new Hono<AppEnv>();

  // GET /api/v1/academy/tracks
  academyApp.get(
    "/tracks",
    academyController.action(academyController.getTracks, { requireAuth: false })
  );
  
  // GET /api/v1/academy/tracks/:slug
  academyApp.get(
    "/tracks/:slug",
    academyController.action(academyController.getTrackConfig, { requireAuth: false })
  );

  // GET /api/v1/academy/tracks/:trackSlug/concepts/:conceptSlug
  academyApp.get(
    "/tracks/:trackSlug/concepts/:conceptSlug",
    academyController.action(academyController.getTrackConcept, { requireAuth: false })
  );

  app.route("/academy", academyApp);
};
