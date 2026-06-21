import { BaseController } from "../base.controller";
import { type ICradle } from "../../libs/awilix-container";
import { type IArenaAdminService } from "../../services/arena/arena.admin.service";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";

export class ArenaAdminController extends BaseController {
  private readonly arenaAdminService: IArenaAdminService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.arenaAdminService = cradle.arenaAdminService;
  }

  async getStats(req: ControllerRequest<never>): Promise<any> {
    return this.arenaAdminService.getStats();
  }
}
