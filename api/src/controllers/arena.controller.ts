import type { Context } from "hono";
import type { AppEnv, ValidatedContext } from "../types/hono.types";
import type { CreateRoomInput, UpdateRoomProblemInput } from "../validators/arena.validator";
import { BaseController } from "./base.controller";
import type { ArenaService } from "../services/arena.service";
import { AppError } from "../utils/app-error";

export class ArenaController extends BaseController {
  constructor(private readonly arenaService: ArenaService) {
    super();
  }

  async createRoom(c: Context<AppEnv, any, ValidatedContext<CreateRoomInput>>) {
    const auth = this.getAuth(c);
    const body = this.getBody(c);

    const room = await this.arenaService.createRoom(
      auth.clerkUserId,
      body,
    );

    return this.ok(c, room);
  }

  async updateRoomProblem(c: Context<AppEnv, any, ValidatedContext<UpdateRoomProblemInput>>) {
    const auth = this.getAuth(c);

    const roomId = c.req.param("roomId")?.toUpperCase();
    if (!roomId) throw AppError.badRequest("Room ID is required");

    const body = this.getBody(c);

    const room = await this.arenaService.updateRoomProblem(
      auth.clerkUserId,
      roomId,
      body,
    );

    return this.ok(c, room);
  }

  async startMatch(c: Context<AppEnv>) {
    const auth = this.getAuth(c);

    const roomId = c.req.param("roomId")?.toUpperCase();
    if (!roomId) throw AppError.badRequest("Room ID is required");

    const result = await this.arenaService.startMatch(auth.clerkUserId, roomId);

    return this.ok(c, result);
  }

  async getMatchStatus(c: Context) {
    const matchId = c.req.param("matchId");
    if (!matchId) throw AppError.badRequest("Match ID is required");

    const match = await this.arenaService.getMatchStatus(matchId);

    return this.ok(c, match);
  }

  async getRoom(c: Context) {
    const roomId = c.req.param("roomId")?.toUpperCase();
    if (!roomId) throw AppError.badRequest("Room ID is required");

    const room = await this.arenaService.getRoom(roomId);

    return this.ok(c, room);
  }
}

