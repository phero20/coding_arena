import { BaseController } from "../base.controller";
import { type ICompanyService } from "../../services/company/company.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";

export class CompanyController extends BaseController {
  private readonly companyService: ICompanyService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.companyService = cradle.companyService;
  }

  async getCompanies(_req: ControllerRequest<never, never, never>) {
    return await this.companyService.getCompanies();
  }

  async getCompanyProblems(req: ControllerRequest<never, { slug: string }, never>) {
    return await this.companyService.getCompanyProblems(req.params.slug);
  }
}
