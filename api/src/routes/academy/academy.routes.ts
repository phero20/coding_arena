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
  const academyApp = new Hono<AppEnv>();

  // GET /api/v1/academy/tracks
  academyApp.get("/tracks", deps.academyController.getTracks);

  app.route("/academy", academyApp);
};
