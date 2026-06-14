import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import type { ICompanyService, CompanyService } from "../../services/company/company.service";
import { type ICradle } from "../../libs/awilix-container";

const logger = createLogger("company-cache");

export class CompanyCache implements ICompanyService {
  private readonly CACHE_TTL = 86400; // 24 hours
  private readonly rawCompanyService: CompanyService;

  constructor({ rawCompanyService }: ICradle) {
    this.rawCompanyService = rawCompanyService;
  }

  async getCompanies(): Promise<any> {
    const key = `company:all`;

    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      logger.error({ err }, "Redis get error for companies list");
    }

    const companies = await this.rawCompanyService.getCompanies();

    if (companies) {
      try {
        await redis.set(key, JSON.stringify(companies), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ err }, "Redis set error for companies list");
      }
    }

    return companies;
  }

  async getCompanyProblems(slug: string): Promise<any> {
    const key = `company:problems:${slug}`;

    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      logger.error({ slug, err }, "Redis get error for company problems");
    }

    const data = await this.rawCompanyService.getCompanyProblems(slug);

    if (data) {
      try {
        await redis.set(key, JSON.stringify(data), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ slug, err }, "Redis set error for company problems");
      }
    }

    return data;
  }

  async createCompany(data: any): Promise<any> {
    const company = await this.rawCompanyService.createCompany(data);

    try {
      // Invalidate the cache for the entire grid, and the specific company page
      await redis.del(`company:all`);
      await redis.del(`company:problems:${data.slug}`);
      logger.info({ slug: data.slug }, "Invalidated company caches");
    } catch (err) {
      logger.error({ slug: data.slug, err }, "Redis invalidation error");
    }

    return company;
  }
}
