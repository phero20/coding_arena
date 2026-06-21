import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { type TaxonomyAdminController } from "../../controllers/taxonomy/taxonomy.admin.controller";
import { type AuthMiddleware } from "../../middlewares/security/auth.middleware";
import { type AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";
import {
  createCategorySchema,
  updateCategorySchema,
  mapProblemSchema,
  batchMapProblemSchema,
} from "../../validators/taxonomy/taxonomy.validator";
import { UuidParamSchema } from "../../validators/common/common.validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";

export interface TaxonomyAdminRouteDeps {
  taxonomyAdminController: TaxonomyAdminController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerTaxonomyAdminRoutes = (
  app: Hono<AppEnv>,
  deps: TaxonomyAdminRouteDeps,
) => {
  const { taxonomyAdminController, authMiddleware, authorizationMiddleware } = deps;
  const adminApp = new Hono<AppEnv>();

  // Ensure all routes require Auth and Admin role
  adminApp.use("*", authMiddleware.handle.bind(authMiddleware));
  adminApp.use("*", authorizationMiddleware.requireRoles("admin"));
  adminApp.get(
    "/tree",
    taxonomyAdminController.action(taxonomyAdminController.getAdminTree.bind(taxonomyAdminController))
  );

  adminApp.get(
    "/:id/problems",
    zValidator("param", UuidParamSchema),
    taxonomyAdminController.action(taxonomyAdminController.getCategoryProblems.bind(taxonomyAdminController))
  );

  adminApp.post(
    "/categories",
    zValidator("json", createCategorySchema),
    taxonomyAdminController.action(taxonomyAdminController.createCategory.bind(taxonomyAdminController), { status: 201 })
  );

  adminApp.put(
    "/categories/:id",
    zValidator("json", updateCategorySchema),
    taxonomyAdminController.action(taxonomyAdminController.updateCategory.bind(taxonomyAdminController))
  );

  adminApp.delete(
    "/categories/:id",
    taxonomyAdminController.action(taxonomyAdminController.deleteCategory.bind(taxonomyAdminController))
  );

  adminApp.post(
    "/map",
    zValidator("json", mapProblemSchema),
    taxonomyAdminController.action(taxonomyAdminController.mapProblem.bind(taxonomyAdminController))
  );

  adminApp.post(
    "/map/batch",
    zValidator("json", batchMapProblemSchema),
    taxonomyAdminController.action(taxonomyAdminController.batchMapProblems.bind(taxonomyAdminController))
  );

  adminApp.delete(
    "/map/:categoryId/:problemId",
    taxonomyAdminController.action(taxonomyAdminController.unmapProblem.bind(taxonomyAdminController))
  );

  adminApp.get(
    "/stats",
    taxonomyAdminController.action(taxonomyAdminController.getRoadmapStats.bind(taxonomyAdminController))
  );

  app.route("/admin/taxonomy", adminApp);
};
