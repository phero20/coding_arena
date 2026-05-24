import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  createDiagramSchema,
  updateDiagramSchema,
} from "../../validators/workspace.validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import type { WorkspaceController } from "../../controllers/workspace/workspace.controller";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";

export const registerWorkspaceRoutes = (
  app: Hono<AppEnv>,
  {
    workspaceController,
    authMiddleware,
  }: {
    workspaceController: WorkspaceController;
    authMiddleware: AuthMiddleware;
  },
) => {
  const workspaces = new Hono<AppEnv>();
  const diagrams = new Hono<AppEnv>();

  // Secure all endpoints with Clerk Authentication
  workspaces.use(authMiddleware.handle.bind(authMiddleware));
  diagrams.use(authMiddleware.handle.bind(authMiddleware));

  // --- Workspace Routes ---
  workspaces.get(
    "/",
    workspaceController.action(workspaceController.getWorkspaces)
  );

  workspaces.post(
    "/",
    zValidator("json", createWorkspaceSchema),
    workspaceController.action(workspaceController.createWorkspace, { status: 201 })
  );

  workspaces.get(
    "/:id",
    workspaceController.action(workspaceController.getWorkspaceById)
  );

  workspaces.patch(
    "/:id",
    zValidator("json", updateWorkspaceSchema),
    workspaceController.action(workspaceController.updateWorkspace)
  );

  workspaces.delete(
    "/:id",
    workspaceController.action(workspaceController.deleteWorkspace)
  );

  // --- Diagram Routes ---
  workspaces.get(
    "/:workspaceId/diagrams",
    workspaceController.action(workspaceController.getDiagrams)
  );

  workspaces.post(
    "/:workspaceId/diagrams",
    zValidator("json", createDiagramSchema),
    workspaceController.action(workspaceController.createDiagram, { status: 201 })
  );

  diagrams.get(
    "/:id",
    workspaceController.action(workspaceController.getDiagramById)
  );

  diagrams.patch(
    "/:id",
    zValidator("json", updateDiagramSchema),
    workspaceController.action(workspaceController.updateDiagram)
  );

  diagrams.delete(
    "/:id",
    workspaceController.action(workspaceController.deleteDiagram)
  );

  diagrams.post(
    "/:id/clone",
    workspaceController.action(workspaceController.cloneDiagram, { status: 201 })
  );

  app.route("/workspaces", workspaces);
  app.route("/diagrams", diagrams);
};
