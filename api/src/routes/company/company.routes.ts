import { Hono } from "hono";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import { type CompanyController } from "../../controllers/company/company.controller";
import { zValidator } from "@hono/zod-validator";
import { createCompanySchema } from "../../validators/company.validator";

export interface CompanyRouteDependencies {
  companyController: CompanyController;
}

export const registerCompanyRoutes = (
  app: Hono<AppEnv>,
  deps: CompanyRouteDependencies
) => {
  const { companyController } = deps;
  const companyApp = new Hono<AppEnv>();

  // GET /api/v1/companies
  companyApp.get(
    "/",
    companyController.action(companyController.getCompanies, { requireAuth: false })
  );

  // GET /api/v1/companies/:slug/problems
  companyApp.get(
    "/:slug/problems",
    companyController.action(companyController.getCompanyProblems, { requireAuth: false })
  );

  // POST /api/v1/companies
  companyApp.post(
    "/",
    zValidator("json", createCompanySchema),
    companyController.action(companyController.createCompany, { requireAuth: false })
  );

  app.route("/companies", companyApp);
};
