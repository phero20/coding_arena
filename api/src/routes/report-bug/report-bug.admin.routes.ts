import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ReportBugAdminController } from "../../controllers/report-bug/report-bug.admin.controller";
import { AuthMiddleware } from "../../middlewares/security/auth.middleware";
import { AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";
import { createBugReportSchema, updateBugReportSchema } from "../../validators/report-bug/report-bug.admin.validator";
import { UuidParamSchema } from "../../validators/common/common.validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";

export interface ReportBugAdminRouteDeps {
  reportBugAdminController: ReportBugAdminController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerReportBugAdminRoutes = (
  app: Hono<AppEnv>,
  deps: ReportBugAdminRouteDeps,
) => {
  const { reportBugAdminController, authMiddleware, authorizationMiddleware } = deps;
  const adminApp = new Hono<AppEnv>();

  adminApp.use("*", authMiddleware.handle.bind(authMiddleware));
  adminApp.use("*", authorizationMiddleware.requireRoles("admin"));

  adminApp.get("/", reportBugAdminController.action(reportBugAdminController.getAllReports.bind(reportBugAdminController)));
  
  adminApp.post(
    "/",
    reportBugAdminController.createReport
  );

  adminApp.put(
    "/:id",
    reportBugAdminController.updateReport
  );

  adminApp.delete(
    "/:id",
    zValidator("param", UuidParamSchema),
    reportBugAdminController.action(reportBugAdminController.deleteReport.bind(reportBugAdminController))
  );

  app.route("/admin/bug-reports", adminApp);
};
