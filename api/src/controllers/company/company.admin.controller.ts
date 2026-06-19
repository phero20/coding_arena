import { BaseController } from "../base.controller";
import { type ICompanyAdminService } from "../../services/company/company.admin.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import {
  type CreateCompanyPayload,
  type UpdateCompanyPayload,
} from "../../types/company/company.admin.types";

export class CompanyAdminController extends BaseController {
  private readonly companyAdminService: ICompanyAdminService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.companyAdminService = cradle.companyAdminService;
  }

  async getAllCompanies(req: ControllerRequest<never>): Promise<any> {
    return this.companyAdminService.getAllCompanies();
  }

  async createCompany(req: ControllerRequest<CreateCompanyPayload>): Promise<any> {
    return this.companyAdminService.createCompany(req.body);
  }

  async updateCompany(req: ControllerRequest<UpdateCompanyPayload, { id: string }>): Promise<any> {
    return this.companyAdminService.updateCompany(req.params.id, req.body);
  }

  async deleteCompany(req: ControllerRequest<never, { id: string }>): Promise<{ success: boolean }> {
    await this.companyAdminService.deleteCompany(req.params.id);
    return { success: true };
  }
}
