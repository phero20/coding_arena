import { BaseController } from "../base.controller";
import { type IReportBugService } from "../../services/report-bug/report-bug.service";
import { type ICradle } from "../../libs/awilix-container";
import type { Context } from "hono";

export class ReportBugController extends BaseController {
  private readonly reportBugService: IReportBugService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.reportBugService = cradle.reportBugService;
  }

  submitReport = async (c: Context) => {
    const body = await c.req.parseBody({ all: true });

    const report = await this.reportBugService.submitReport({
      title: body["title"] as string,
      description: body["description"] as string,
      type: body["type"] as string,
      images: body["images"] as (File | string)[] | File | string | undefined,
    });

    return this.created(c, report);
  };
}
