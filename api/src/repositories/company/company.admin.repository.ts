import { MongoBaseRepository } from "../base.repository";
import { CompanyModel, type CompanyDocument, type Company } from "../../mongo/models/company.model";
import type {
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "../../types/company/company.admin.types";

export interface ICompanyAdminRepository {
  createCompany(payload: CreateCompanyPayload): Promise<Company>;
  getAllCompanies(): Promise<Company[]>;
  findById(id: string): Promise<Company | null>;
  findBySlug(slug: string): Promise<Company | null>;
  updateCompany(id: string, payload: UpdateCompanyPayload): Promise<Company | null>;
  deleteCompany(id: string): Promise<void>;
}

export class CompanyAdminRepository
  extends MongoBaseRepository<Company, CompanyDocument>
  implements ICompanyAdminRepository
{
  constructor() {
    super(CompanyModel);
  }

  async createCompany(payload: CreateCompanyPayload): Promise<Company> {
    const doc = await this.model.create(payload);
    return this.toDomain(doc) as Company;
  }

  async getAllCompanies(): Promise<Company[]> {
    const docs = await this.model.find().sort({ name: 1 }).lean().exec();
    return this.toDomainArray(docs as any[]);
  }

  async findBySlug(slug: string): Promise<Company | null> {
    const doc = await this.model.findOne({ slug }).lean().exec();
    return this.toDomain(doc as any);
  }

  // findById is inherited from MongoBaseRepository

  async updateCompany(id: string, payload: UpdateCompanyPayload): Promise<Company | null> {
    const doc = await this.model.findByIdAndUpdate(id, { $set: payload }, { new: true }).lean().exec();
    return this.toDomain(doc as any);
  }

  async deleteCompany(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }
}
