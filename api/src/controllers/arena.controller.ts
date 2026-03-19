import { Context } from "hono";
import { ArenaService } from "../services/arena.service";
import { AppError } from "../utils/app-error";
import { ApiResponse } from "../utils/api-response";

export class ArenaController {
  constructor(
    private readonly arenaService: ArenaService
  ) {}

  async createRoom(c: Context) {
    const auth = c.get("auth");
    if (!auth) throw AppError.unauthorized();

    let problemDetails = {};
    try {
      problemDetails = await c.req.json();
    } catch (e) {
      // Body might be empty, which is fine for custom battles
    }

    const room = await this.arenaService.createRoom(auth.clerkUserId, problemDetails);

    return c.json(ApiResponse.success(room).toJSON());
  }

  async updateRoomProblem(c: Context) {
    const auth = c.get("auth");
    if (!auth) throw AppError.unauthorized();

    const roomId = c.req.param("roomId")?.toUpperCase();
    if (!roomId) throw AppError.badRequest("Room ID is required");

    let problemDetails;
    try {
      problemDetails = await c.req.json();
    } catch (e) {
      throw AppError.badRequest("Invalid problem details provided");
    }

    if (!problemDetails.problemId || !problemDetails.problemSlug) {
      throw AppError.badRequest("Problem ID and Slug are required");
    }

    const room = await this.arenaService.updateRoomProblem(
      auth.clerkUserId,
      roomId,
      problemDetails
    );

    return c.json(ApiResponse.success(room).toJSON());
  }

  async getRoom(c: Context) {
    const roomId = c.req.param("roomId")?.toUpperCase();
    if (!roomId) throw AppError.badRequest("Room ID is required");
    
    const room = await this.arenaService.getRoom(roomId);
    
    return c.json(ApiResponse.success(room).toJSON());
  }
}
