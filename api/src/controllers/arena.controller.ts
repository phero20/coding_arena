import { Context } from "hono";
import { ArenaRepository } from "../repositories/arena.repository";
import { ArenaRoom, ArenaPlayer } from "../arena/arena.types";
import { AppError } from "../utils/app-error";
import { ApiResponse } from "../utils/api-response";
import { UserRepository } from "../repositories/user.repository";

export class ArenaController {
  constructor(
    private readonly arenaRepository: ArenaRepository,
    private readonly userRepository: UserRepository
  ) {}

  async createRoom(c: Context) {
    const auth = c.get("auth");
    if (!auth) throw AppError.unauthorized();

    const user = await this.userRepository.findByClerkId(auth.clerkUserId);
    if (!user) throw AppError.notFound("User not found");

    // Robust body parsing
    let problemId: string | undefined;
    let problemSlug: string | undefined;
    let difficulty: string | undefined;
    let language: string | undefined;
    
    try {
      const body = await c.req.json();
      problemId = body.problemId;
      problemSlug = body.problemSlug;
      difficulty = body.difficulty;
      language = body.language;
    } catch (e) {
      // Body might be empty or invalid, which is fine for custom battles
    }

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const creator: ArenaPlayer = {
      userId: auth.clerkUserId,
      username: user.username,
      avatarUrl: user.avatarUrl || "",
      isReady: false,
      isCreator: true,
      score: 0,
      testsPassed: 0,
      totalTests: 0,
      status: "CODING",
    };

    // Format a nice topic if slug is available
    const formattedTopic = problemSlug 
      ? problemSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : "Custom Battle";

    const room: ArenaRoom = {
      roomId,
      status: "WAITING",
      topic: formattedTopic,
      problemId,
      problemSlug,
      difficulty,
      language,
      players: { [auth.clerkUserId]: creator },
      createdAt: new Date(),
    };

    await this.arenaRepository.createRoom(room);

    return c.json(ApiResponse.success(room).toJSON());
  }

  async updateRoomProblem(c: Context) {
    const auth = c.get("auth");
    if (!auth) throw AppError.unauthorized();

    const roomId = c.req.param("roomId")?.toUpperCase();
    if (!roomId) throw AppError.badRequest("Room ID is required");

    const room = await this.arenaRepository.getRoom(roomId);
    if (!room) throw AppError.notFound("Arena room not found");

    // Check if user is host
    if (room.players[auth.clerkUserId]?.isCreator === false) {
      throw AppError.forbidden("Only the host can change the problem");
    }

    // Parse new problem details
    let problemId: string | undefined;
    let problemSlug: string | undefined;
    let difficulty: string | undefined;
    let language: string | undefined;

    try {
      const body = await c.req.json();
      problemId = body.problemId;
      problemSlug = body.problemSlug;
      difficulty = body.difficulty;
      language = body.language;
    } catch (e) {
      throw AppError.badRequest("Invalid problem details provided");
    }

    if (!problemId || !problemSlug) {
      throw AppError.badRequest("Problem ID and Slug are required");
    }

    // Format new topic
    const formattedTopic = problemSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Update room and reset all players' readiness
    room.problemId = problemId;
    room.problemSlug = problemSlug;
    room.difficulty = difficulty;
    room.language = language;
    room.topic = formattedTopic;

    Object.keys(room.players).forEach(userId => {
      room.players[userId].isReady = false;
    });

    await this.arenaRepository.createRoom(room); // createRoom acts as upsert

    // Notify other services (Go microservice) via Redis Pub/Sub
    const { redis } = await import("../libs/redis");
    await redis.publish("arena:room:updates", roomId);

    return c.json(ApiResponse.success(room).toJSON());
  }

  async getRoom(c: Context) {
    const roomId = c.req.param("roomId")?.toUpperCase();
    if (!roomId) throw AppError.badRequest("Room ID is required");
    
    const room = await this.arenaRepository.getRoom(roomId);
    
    if (!room) {
      throw AppError.notFound("Arena room not found");
    }

    return c.json(ApiResponse.success(room).toJSON());
  }
}
