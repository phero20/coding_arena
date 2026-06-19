import { BaseController } from "../base.controller";
import { type ReportBugAdminService } from "../../services/report-bug/report-bug.admin.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import type { Context } from "hono";

export class ReportBugAdminController extends BaseController {
  private readonly reportBugAdminService: ReportBugAdminService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.reportBugAdminService = cradle.reportBugAdminService;
  }

  async getAllReports(req: ControllerRequest<never>): Promise<any> {
    return this.reportBugAdminService.getAllReports();
  }

  createReport = async (c: Context) => {
    const body = await c.req.parseBody({ all: true });
    const report = await this.reportBugAdminService.createReport({
      title: body.title as string,
      description: body.description as string,
      type: body.type as string,
      status: body.status as string,
      images: body.images as (File | string)[] | File | string | undefined,
    });
    return this.created(c, report);
  }

  updateReport = async (c: Context) => {
    const { id } = c.req.param();
    const body = await c.req.parseBody({ all: true });
    const report = await this.reportBugAdminService.updateReport(id, {
      title: body.title as string,
      description: body.description as string,
      type: body.type as string,
      status: body.status as string,
      images: body.images as (File | string)[] | File | string | undefined,
    });
    return this.ok(c, report);
  }

  async deleteReport(req: ControllerRequest<never, { id: string }>): Promise<{ success: boolean }> {
    await this.reportBugAdminService.deleteReport(req.params.id);
    return { success: true };
  }
}
