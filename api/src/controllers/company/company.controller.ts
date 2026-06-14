import { BaseController } from "../base.controller";
import { type ICompanyService } from "../../services/company/company.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import { ApiResponse } from "../../utils/api-response";
import { type CreateCompanyInput } from "../../validators/company.validator";

export class CompanyController extends BaseController {
  private readonly companyService: ICompanyService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.companyService = cradle.companyService;
  }

  async getCompanies(_req: ControllerRequest<never, never, never>) {
    const data = await this.companyService.getCompanies();
    return ApiResponse.success(data);
  }

  async getCompanyProblems(req: ControllerRequest<never, { slug: string }, never>) {
    const data = await this.companyService.getCompanyProblems(req.params.slug);
    return ApiResponse.success(data);
  }

  async createCompany(req: ControllerRequest<CreateCompanyInput, never, never>) {
    const data = await this.companyService.createCompany(req.body!);
    return ApiResponse.success(data);
  }
}
