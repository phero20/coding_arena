import { MongoBaseRepository } from "../base.repository";
import { CompanyModel, type Company, type CompanyDocument } from "../../mongo/models/company.model";
import { type ICradle } from "../../libs/awilix-container";

export interface ICompanyRepository {
  getCompanies(): Promise<Partial<Company>[]>;
  getCompanyBySlug(slug: string): Promise<Company | null>;
  createOrUpdate(data: Partial<Company>): Promise<Company>;
}

export class CompanyRepository extends MongoBaseRepository<Company, CompanyDocument> implements ICompanyRepository {
  constructor(_: ICradle) {
    super(CompanyModel);
  }

  // Optimized for grid view: drops the massive problem_ids array and sorts alphabetically
  async getCompanies(): Promise<Partial<Company>[]> {
    const docs = await this.model
      .find()
      .select("-problem_ids")
      .lean()
      .exec();
    
    return this.toDomainArray(docs as any[]);
  }

  // Instantly fetches a single company and its problem IDs
  async getCompanyBySlug(slug: string): Promise<Company | null> {
    const doc = await this.model.findOne({ slug }).lean().exec();
    if (!doc) return null;
    return this.toDomain(doc as any);
  }

  // Safe upsert method for your upload script
  async createOrUpdate(data: Partial<Company>): Promise<Company> {
    const doc = await this.model.findOneAndUpdate(
      { slug: data.slug },
      { $set: data },
      { returnDocument: "after", upsert: true }
    ).exec();

    return this.toDomain(doc as any) as Company;
  }
}
