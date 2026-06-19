import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { type CompanyAdminController } from "../../controllers/company/company.admin.controller";
import { type AuthMiddleware } from "../../middlewares/security/auth.middleware";
import { type AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";
import {
  createCompanySchema,
  updateCompanySchema,
} from "../../validators/company/company.admin.validator";
import { IdParamSchema } from "../../validators/common/common.validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";

export interface CompanyAdminRouteDeps {
  companyAdminController: CompanyAdminController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerCompanyAdminRoutes = (
  app: Hono<AppEnv>,
  deps: CompanyAdminRouteDeps,
) => {
  const { companyAdminController, authMiddleware, authorizationMiddleware } = deps;
  const adminApp = new Hono<AppEnv>();

  // Ensure all routes require Auth and Admin role
  adminApp.use("*", authMiddleware.handle.bind(authMiddleware));
  adminApp.use("*", authorizationMiddleware.requireRoles("admin"));

  adminApp.get(
    "",
    companyAdminController.action(companyAdminController.getAllCompanies.bind(companyAdminController))
  );

  adminApp.post(
    "",
    zValidator("json", createCompanySchema),
    companyAdminController.action(companyAdminController.createCompany.bind(companyAdminController), { status: 201 })
  );

  adminApp.put(
    "/:id",
    zValidator("param", IdParamSchema),
    zValidator("json", updateCompanySchema),
    companyAdminController.action(companyAdminController.updateCompany.bind(companyAdminController))
  );

  adminApp.delete(
    "/:id",
    zValidator("param", IdParamSchema),
    companyAdminController.action(companyAdminController.deleteCompany.bind(companyAdminController))
  );

  app.route("/admin/company", adminApp);
};
