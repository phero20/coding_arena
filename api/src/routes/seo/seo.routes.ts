import { Hono } from "hono";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import { type SeoController } from "../../controllers/seo/seo.controller";

export interface RegisterSeoRoutesDeps {
  seoController: SeoController;
}

export const registerSeoRoutes = (
  app: Hono<AppEnv>,
  { seoController }: RegisterSeoRoutesDeps
) => {
  const seoApp = new Hono<AppEnv>();

  seoApp.get(
    "/sitemap/problems",
    seoController.action(seoController.getSitemapProblems, { requireAuth: false })
  );

  seoApp.get(
    "/sitemap/academy-tracks",
    seoController.action(seoController.getSitemapAcademyTracks, { requireAuth: false })
  );

  seoApp.get(
    "/sitemap/academy-exercises",
    seoController.action(seoController.getSitemapAcademyExercises, { requireAuth: false })
  );

  seoApp.get(
    "/sitemap/system-design-lessons",
    seoController.action(seoController.getSitemapSystemDesignLessons, { requireAuth: false })
  );

  seoApp.get(
    "/sitemap/company-tags",
    seoController.action(seoController.getSitemapCompanyTags, { requireAuth: false })
  );

  seoApp.get(
    "/sitemap/users",
    seoController.action(seoController.getSitemapUsers, { requireAuth: false })
  );

  app.route("/seo", seoApp);
};
