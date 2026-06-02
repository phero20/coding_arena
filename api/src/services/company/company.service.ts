import { type ICompanyRepository } from "../../repositories/company/company.repository";
import { AppError } from "../../utils/app-error";

export interface ICompanyService {
  getCompanies(): Promise<any>;
  getCompanyProblems(slug: string): Promise<any>;
}

export class CompanyService implements ICompanyService {
  private companyRepository: ICompanyRepository;

  constructor({ companyRepository }: { companyRepository: ICompanyRepository }) {
    this.companyRepository = companyRepository;
  }

  async getCompanies(): Promise<any> {
    try {
      return await this.companyRepository.getCompanies();
    } catch (error: any) {
      if (error.code === 'ENOENT') return [];
      throw new AppError("Failed to fetch companies", { statusCode: 500 });
    }
  }

  async getCompanyProblems(slug: string): Promise<any> {
    if (!slug) {
      throw new AppError("Company slug is required", { statusCode: 400 });
    }

    try {
      const problems = await this.companyRepository.getCompanyProblems(slug);
      return problems;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new AppError("Company not found or has no problems", { statusCode: 404 });
      }
      throw new AppError("Failed to fetch company problems", { statusCode: 500 });
    }
  }
}
