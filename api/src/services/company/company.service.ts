import { type ICompanyRepository } from "../../repositories/company/company.repository";
import { type IProblemRepository } from "../../repositories/problems/problem.repository";
import { AppError } from "../../utils/app-error";

export interface ICompanyService {
  getCompanies(): Promise<any>;
  getCompanyProblems(slug: string): Promise<any>;
  createCompany(data: any): Promise<any>;
}

export class CompanyService implements ICompanyService {
  private companyRepository: ICompanyRepository;
  private problemRepository: IProblemRepository;

  constructor({ companyRepository, problemRepository }: { companyRepository: ICompanyRepository, problemRepository: IProblemRepository }) {
    this.companyRepository = companyRepository;
    this.problemRepository = problemRepository;
  }

  async getCompanies(): Promise<any> {
    try {
      return await this.companyRepository.getCompanies();
    } catch (error: any) {
      throw new AppError("Failed to fetch companies", { statusCode: 500 });
    }
  }

  async getCompanyProblems(slug: string): Promise<any> {
    if (!slug) {
      throw new AppError("Company slug is required", { statusCode: 400 });
    }

    try {
      const company = await this.companyRepository.getCompanyBySlug(slug);
      if (!company) {
        throw new AppError("Company not found", { statusCode: 404 });
      }

      // Automatically join the real problem data using the highly optimized bulk fetcher!
      // This guarantees the UI always shows the single source of truth for problem titles/difficulties.
      const problems = await this.problemRepository.findManyByProblemIds(company.problem_ids);
      
      // Return both the company details (name, logo) AND its hydrated problems array!
      return {
        company: { slug: company.slug, name: company.name, imageUrl: company.imageUrl },
        problems
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to fetch company problems", { statusCode: 500 });
    }
  }

  async createCompany(data: any): Promise<any> {
    return await this.companyRepository.createOrUpdate(data);
  }
}
