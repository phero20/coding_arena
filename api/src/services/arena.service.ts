import { ArenaRepository } from "../repositories/arena.repository";
import { UserRepository } from "../repositories/user.repository";
import { ArenaRoom, ArenaPlayer } from "../arena/arena.types";
import { AppError } from "../utils/app-error";
import { redis } from "../libs/redis";

export class ArenaService {
  constructor(
    private readonly arenaRepository: ArenaRepository,
    private readonly userRepository: UserRepository
  ) {}

  async createRoom(clerkUserId: string, details: {
    problemId?: string;
    problemSlug?: string;
    difficulty?: string;
    language?: string;
  }): Promise<ArenaRoom> {
    const user = await this.userRepository.findByClerkId(clerkUserId);
    if (!user) throw AppError.notFound("User not found");

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const creator: ArenaPlayer = {
      userId: clerkUserId,
      username: user.username,
      avatarUrl: user.avatarUrl || "",
      isCreator: true,
      score: 0,
      testsPassed: 0,
      totalTests: 0,
      status: "CODING",
      joinedAt: new Date(),
    };

    // Format a nice topic if slug is available
    const formattedTopic = details.problemSlug 
      ? details.problemSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : "Custom Battle";

    const room: ArenaRoom = {
      roomId,
      status: "WAITING",
      topic: formattedTopic,
      problemId: details.problemId,
      problemSlug: details.problemSlug,
      difficulty: details.difficulty,
      language: details.language,
      players: { [clerkUserId]: creator },
      createdAt: new Date(),
    };

    await this.arenaRepository.createRoom(room);
    return room;
  }

  async updateRoomProblem(clerkUserId: string, roomId: string, details: {
    problemId: string;
    problemSlug: string;
    difficulty?: string;
    language?: string;
  }): Promise<ArenaRoom> {
    const room = await this.arenaRepository.getRoom(roomId);
    if (!room) throw AppError.notFound("Arena room not found");

    // Check if user is host
    if (room.players[clerkUserId]?.isCreator === false) {
      throw AppError.forbidden("Only the host can change the problem");
    }

    // Format new topic
    const formattedTopic = details.problemSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Update room
    room.problemId = details.problemId;
    room.problemSlug = details.problemSlug;
    room.difficulty = details.difficulty;
    room.language = details.language;
    room.topic = formattedTopic;

    await this.arenaRepository.createRoom(room); // createRoom acts as upsert

    // Notify other services (Go microservice) via Redis Pub/Sub
    await redis.publish("arena:room:updates", roomId);

    return room;
  }

  async getRoom(roomId: string): Promise<ArenaRoom> {
    const room = await this.arenaRepository.getRoom(roomId);
    if (!room) {
      throw AppError.notFound("Arena room not found");
    }
    return room;
  }
}
