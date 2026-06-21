import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import { type AcademyAdminController } from "../../controllers/academy/academy.admin.controller";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";
import type { AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";

export interface AcademyAdminRouteDependencies {
  academyAdminController: AcademyAdminController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

const CreateTrackSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  data: z.any(),
});

const UpdateTrackSchema = z.object({
  data: z.any(),
});

const CreateConceptSchema = z.object({
  conceptSlug: z.string().min(1, "Concept slug is required"),
  data: z.any(),
});

const UpdateConceptSchema = z.object({
  data: z.any(),
});

const CreateExerciseSchema = z.object({
  exerciseSlug: z.string().min(1, "Exercise slug is required"),
  data: z.any(),
});

const UpdateExerciseSchema = z.object({
  data: z.any(),
});

export const registerAcademyAdminRoutes = (
  app: Hono<AppEnv>,
  deps: AcademyAdminRouteDependencies
) => {
  const { academyAdminController, authMiddleware, authorizationMiddleware } = deps;
  const adminApp = new Hono<AppEnv>();

  // Ensure all routes require Auth and Admin role
  adminApp.use("*", authMiddleware.handle.bind(authMiddleware));
  adminApp.use("*", authorizationMiddleware.requireRoles("admin"));

  // GET /api/v1/admin/academy/tracks
  adminApp.get(
    "/tracks",
    academyAdminController.action(academyAdminController.getAllTracks, { requireAuth: true })
  );

  // GET /api/v1/admin/academy/stats
  adminApp.get(
    "/stats",
    academyAdminController.action(academyAdminController.getStats, { requireAuth: true })
  );

  // POST /api/v1/admin/academy/tracks
  adminApp.post(
    "/tracks",
    zValidator("json", CreateTrackSchema),
    academyAdminController.action(academyAdminController.createTrack, { requireAuth: true })
  );

  // PUT /api/v1/admin/academy/tracks/:slug
  adminApp.put(
    "/tracks/:slug",
    zValidator("json", UpdateTrackSchema),
    academyAdminController.action(academyAdminController.updateTrack, { requireAuth: true })
  );

  // DELETE /api/v1/admin/academy/tracks/:slug
  adminApp.delete(
    "/tracks/:slug",
    academyAdminController.action(academyAdminController.deleteTrack, { requireAuth: true })
  );

  // --- CONFIGS ---
  // GET /api/v1/admin/academy/configs
  adminApp.get(
    "/configs",
    academyAdminController.action(academyAdminController.getAllConfigs, { requireAuth: true })
  );

  // POST /api/v1/admin/academy/configs
  adminApp.post(
    "/configs",
    zValidator("json", CreateTrackSchema), // Reuse schema since Config is also just slug + data
    academyAdminController.action(academyAdminController.createConfig, { requireAuth: true })
  );

  // PUT /api/v1/admin/academy/configs/:slug
  adminApp.put(
    "/configs/:slug",
    zValidator("json", UpdateTrackSchema), // Reuse schema since Config is also just data
    academyAdminController.action(academyAdminController.updateConfig, { requireAuth: true })
  );

  // DELETE /api/v1/admin/academy/configs/:slug
  adminApp.delete(
    "/configs/:slug",
    academyAdminController.action(academyAdminController.deleteConfig, { requireAuth: true })
  );

  // --- CONCEPTS ---
  // GET /api/v1/admin/academy/tracks/:trackSlug/concepts
  adminApp.get(
    "/tracks/:trackSlug/concepts",
    academyAdminController.action(academyAdminController.getConceptsByTrack, { requireAuth: true })
  );

  // POST /api/v1/admin/academy/tracks/:trackSlug/concepts
  adminApp.post(
    "/tracks/:trackSlug/concepts",
    zValidator("json", CreateConceptSchema),
    academyAdminController.action(academyAdminController.createConcept, { requireAuth: true })
  );

  // PUT /api/v1/admin/academy/tracks/:trackSlug/concepts/:conceptSlug
  adminApp.put(
    "/tracks/:trackSlug/concepts/:conceptSlug",
    zValidator("json", UpdateConceptSchema),
    academyAdminController.action(academyAdminController.updateConcept, { requireAuth: true })
  );

  // DELETE /api/v1/admin/academy/tracks/:trackSlug/concepts/:conceptSlug
  adminApp.delete(
    "/tracks/:trackSlug/concepts/:conceptSlug",
    academyAdminController.action(academyAdminController.deleteConcept, { requireAuth: true })
  );

  // --- EXERCISES ---
  // GET /api/v1/admin/academy/tracks/:trackSlug/exercises
  adminApp.get(
    "/tracks/:trackSlug/exercises",
    academyAdminController.action(academyAdminController.getExercisesByTrack, { requireAuth: true })
  );

  // POST /api/v1/admin/academy/tracks/:trackSlug/exercises
  adminApp.post(
    "/tracks/:trackSlug/exercises",
    zValidator("json", CreateExerciseSchema),
    academyAdminController.action(academyAdminController.createExercise, { requireAuth: true })
  );

  // PUT /api/v1/admin/academy/tracks/:trackSlug/exercises/:exerciseSlug
  adminApp.put(
    "/tracks/:trackSlug/exercises/:exerciseSlug",
    zValidator("json", UpdateExerciseSchema),
    academyAdminController.action(academyAdminController.updateExercise, { requireAuth: true })
  );

  // DELETE /api/v1/admin/academy/tracks/:trackSlug/exercises/:exerciseSlug
  adminApp.delete(
    "/tracks/:trackSlug/exercises/:exerciseSlug",
    academyAdminController.action(academyAdminController.deleteExercise, { requireAuth: true })
  );

  app.route("/admin/academy", adminApp);
};
