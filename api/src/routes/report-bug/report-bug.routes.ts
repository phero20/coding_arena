import { Hono } from "hono";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import { type ReportBugController } from "../../controllers/report-bug/report-bug.controller";

export const registerReportBugRoutes = (
  app: Hono<AppEnv>,
  deps: {
    reportBugController: ReportBugController;
  }
) => {
  const router = new Hono<AppEnv>();

  router.post("/", deps.reportBugController.submitReport);

  app.route("/report-bug", router);
};
