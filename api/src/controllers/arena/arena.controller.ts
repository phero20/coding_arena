import type { ControllerRequest } from "../../types/infrastructure/hono.types";
import type {
  CreateRoomInput,
  UpdateRoomProblemInput,
} from "../../validators/arena/arena.validator";
import { BaseController } from "../base.controller";
import type { ArenaService } from "../../services/arena/arena.service";
import { AppError } from "../../utils/app-error";
import { ERRORS } from "../../constants/errors";

import { type ICradle } from "../../libs/awilix-container";
import { ArenaMatchService } from "../../services/arena/arena-match.service";

/**
 * ArenaController manages the lifecycle of arena rooms and matches.
 * Refactored to use standard DTOs for improved testability and decoupling.
 */
export class ArenaController extends BaseController {
  private readonly arenaService: ArenaService;
  private readonly arenaMatchService: ArenaMatchService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.arenaService = cradle.arenaService;
    this.arenaMatchService = cradle.arenaMatchService;
  }

  async getUserHistory(req: ControllerRequest<never, { userId: string }>) {
    const userId = req.params.userId;
    if (!userId) throw AppError.from(ERRORS.COMMON.MISSING_PARAMETER);
<<<<<<< HEAD

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    return await this.arenaMatchService.getMatchHistory(userId, limit);
=======
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    const result = await this.arenaMatchService.getMatchHistory(userId, limit, offset);
    
    return {
      ...result,
      pagination: {
        total: result.total,
        limit,
        offset
      }
    };
>>>>>>> prod-deploy
  }

  async createRoom(req: ControllerRequest<CreateRoomInput>) {
    return await this.arenaService.createRoom(req.clerkUserId!, req.body);
  }

  async updateRoomProblem(
    req: ControllerRequest<UpdateRoomProblemInput, { roomId: string }>,
  ) {
    const roomId = req.params.roomId?.toUpperCase();
    if (!roomId) throw AppError.from(ERRORS.COMMON.MISSING_PARAMETER);

    return await this.arenaService.updateRoomProblem(
      req.clerkUserId!,
      roomId,
      req.body,
    );
  }

  async startMatch(req: ControllerRequest<never, { roomId: string }>) {
    const roomId = req.params.roomId?.toUpperCase();
    if (!roomId) throw AppError.from(ERRORS.COMMON.MISSING_PARAMETER);

    return await this.arenaService.startMatch(
      req.clerkUserId!,
      roomId,
      req.requestId,
    );
  }

  async getMatchStatus(req: ControllerRequest<never, { matchId: string }>) {
    const matchId = req.params.matchId;
    if (!matchId) throw AppError.from(ERRORS.COMMON.MISSING_PARAMETER);

    return await this.arenaService.getMatchStatus(matchId);
  }

  async getRoom(req: ControllerRequest<never, { roomId: string }>) {
    const roomId = req.params.roomId?.toUpperCase();
    if (!roomId) throw AppError.from(ERRORS.COMMON.MISSING_PARAMETER);

    return await this.arenaService.getRoom(roomId);
  }

  async getMatchDetail(req: ControllerRequest<never, { matchId: string }>) {
    const matchId = req.params.matchId;
    if (!matchId) throw AppError.from(ERRORS.COMMON.MISSING_PARAMETER);

    return await this.arenaMatchService.getMatchDetail(matchId);
  }
}
