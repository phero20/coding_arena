import fs from "fs/promises";
import path from "path";

export interface ICompanyRepository {
  getCompanies(): Promise<any>;
  getCompanyProblems(slug: string): Promise<any>;
}

export class CompanyRepository implements ICompanyRepository {
  async getCompanies(): Promise<any> {
    const filePath = path.join(__dirname, "../../../../data/static-data/company-wise-problems/companies.json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }

  async getCompanyProblems(slug: string): Promise<any> {
    const filePath = path.join(__dirname, `../../../../data/static-data/company-wise-problems/problems/${slug}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }
}
