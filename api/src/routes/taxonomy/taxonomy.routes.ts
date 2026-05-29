import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { type TaxonomyController } from "../../controllers/taxonomy/taxonomy.controller";
import { type AuthMiddleware } from "../../middlewares/security/auth.middleware";
import { type AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";
import {
  createCategorySchema,
  mapProblemSchema,
  batchMapProblemSchema,
} from "../../validators/taxonomy/taxonomy.validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";

export interface TaxonomyRouteDeps {
  taxonomyController: TaxonomyController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

/**
 * Registers all Taxonomy API routes under the provided Hono app instance.
 * Public routes: tree view and category detail.
 * Protected routes: category creation and problem mapping (admin only).
 */
export const registerTaxonomyRoutes = (
  app: Hono<AppEnv>,
  deps: TaxonomyRouteDeps,
) => {
  const { taxonomyController, authMiddleware, authorizationMiddleware } = deps;

  /**
   * GET /api/v1/taxonomy/tree
   * Public: Retrieves the full hierarchical taxonomy tree.
   */
  app.get(
    "/taxonomy/tree",
    taxonomyController.action(
      taxonomyController.getTree.bind(taxonomyController),
      { requireAuth: false },
    ),
  );

  /**
   * GET /api/v1/taxonomy/user/progress
   * Private: Returns the user's direct progress map.
   */
  app.get(
    "/taxonomy/user/progress",
    (c, next) => authMiddleware.handle(c, next),
    taxonomyController.action(
      taxonomyController.getUserProgress.bind(taxonomyController),
    ),
  );

  /**
   * GET /api/v1/taxonomy/:slug
   * Public: Retrieves a specific category with its problems.
   */
  app.get(
    "/taxonomy/:slug",
    taxonomyController.action(
      taxonomyController.getCategoryDetail.bind(taxonomyController),
      { requireAuth: false },
    ),
  );

  /**
   * GET /api/v1/taxonomy/detail/:id
   * Public: Retrieves a specific category with its problems by ID.
   */
  app.get(
    "/taxonomy/detail/:id",
    taxonomyController.action(
      taxonomyController.getCategoryDetailById.bind(taxonomyController),
      { requireAuth: false },
    ),
  );

  /**
   * POST /api/v1/taxonomy/categories
   * Admin only: Creates a new category node.
   */
  app.post(
    "/taxonomy/categories",
    (c, next) => authMiddleware.handle(c, next),
    (c, next) => authorizationMiddleware.requireRoles("admin")(c, next),
    zValidator("json", createCategorySchema),
    taxonomyController.action(
      taxonomyController.createCategory.bind(taxonomyController),
      { status: 201 },
    ),
  );

  /**
   * POST /api/v1/taxonomy/map
   * Admin only: Maps a problem to a category.
   */
  app.post(
    "/taxonomy/map",
    (c, next) => authMiddleware.handle(c, next),
    (c, next) => authorizationMiddleware.requireRoles("admin")(c, next),
    zValidator("json", mapProblemSchema),
    taxonomyController.action(
      taxonomyController.mapProblem.bind(taxonomyController),
    ),
  );

  /**
   * POST /api/v1/taxonomy/map/batch
   * Admin only: Bulk maps problems to a category.
   */
  app.post(
    "/taxonomy/map/batch",
    (c, next) => authMiddleware.handle(c, next),
    (c, next) => authorizationMiddleware.requireRoles("admin")(c, next),
    zValidator("json", batchMapProblemSchema),
    taxonomyController.action(
      taxonomyController.batchMapProblems.bind(taxonomyController),
    ),
  );

  /**
   * DELETE /api/v1/taxonomy/map/:categoryId/:problemId
   * Admin only: Removes a problem-to-category mapping.
   */
  app.delete(
    "/taxonomy/map/:categoryId/:problemId",
    (c, next) => authMiddleware.handle(c, next),
    (c, next) => authorizationMiddleware.requireRoles("admin")(c, next),
    taxonomyController.action(
      taxonomyController.unmapProblem.bind(taxonomyController),
    ),
  );
};
