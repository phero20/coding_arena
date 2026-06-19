import { BaseController } from "../base.controller";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import { type ICacheAdminService } from "../../services/system/cache.admin.service";
import { type GetCacheKeysQuery } from "../../validators/system/cache.admin.validator";

export class CacheAdminController extends BaseController {
  private readonly cacheAdminService: ICacheAdminService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.cacheAdminService = cradle.cacheAdminService;
  }

  async getCacheKeys(req: ControllerRequest<never, never, GetCacheKeysQuery>): Promise<any> {
    const { cursor, pattern, count } = req.query;
    return this.cacheAdminService.getCacheKeys(cursor, pattern, count);
  }

  async getKeyDetails(req: ControllerRequest<never, { key: string }>): Promise<any> {
    return this.cacheAdminService.getKeyDetails(req.params.key);
  }

  async deleteKey(req: ControllerRequest<never, { key: string }>): Promise<{ success: boolean }> {
    await this.cacheAdminService.deleteKey(req.params.key);
    return { success: true };
  }

  async flushCache(req: ControllerRequest<never>): Promise<{ success: boolean }> {
    await this.cacheAdminService.flushCache();
    return { success: true };
  }
}
