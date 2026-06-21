import { type ICradle } from "../../libs/awilix-container";
import { type ICompanyAdminRepository } from "../../repositories/company/company.admin.repository";
import {
  type CreateCompanyPayload,
  type UpdateCompanyPayload,
} from "../../types/company/company.admin.types";
import { type Company } from "../../mongo/models/company.model";
import { AppError } from "../../utils/app-error";

export interface ICompanyAdminService {
  createCompany(payload: CreateCompanyPayload): Promise<Company>;
  getAllCompanies(): Promise<Company[]>;
  updateCompany(id: string, payload: UpdateCompanyPayload): Promise<Company>;
  updateCompany(id: string, payload: UpdateCompanyPayload): Promise<Company>;
  deleteCompany(id: string): Promise<void>;
  getStats(): Promise<any>;
}

export class CompanyAdminService implements ICompanyAdminService {
  private readonly companyAdminRepo: ICompanyAdminRepository;

  constructor({ companyAdminRepository }: ICradle) {
    this.companyAdminRepo = companyAdminRepository;
  }

  async createCompany(payload: CreateCompanyPayload): Promise<Company> {
    const existing = await this.companyAdminRepo.findBySlug(payload.slug);
    if (existing) {
      throw AppError.badRequest("Company with this slug already exists.");
    }
    return this.companyAdminRepo.createCompany(payload);
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.companyAdminRepo.getAllCompanies();
  }

  async updateCompany(id: string, payload: UpdateCompanyPayload): Promise<Company> {
    if (payload.slug) {
      const existing = await this.companyAdminRepo.findBySlug(payload.slug);
      if (existing && existing.id !== id) {
        throw AppError.badRequest("Company with this slug already exists.");
      }
    }
    
    const company = await this.companyAdminRepo.updateCompany(id, payload);
    if (!company) {
      throw AppError.notFound("Company not found.");
    }
    return company;
  }

  async deleteCompany(id: string): Promise<void> {
    await this.companyAdminRepo.deleteCompany(id);
  }

  async getStats(): Promise<any> {
    return this.companyAdminRepo.getStats();
  }
}
