import { redis } from "../libs/redis";
import { ArenaRoom } from "../arena/arena.types";

export class ArenaRepository {
  private readonly PREFIX = "arena:room:";
  private readonly USER_ROOM_PREFIX = "arena:user:room:";
  private readonly TTL = 3600; // 1 hour for room lifetime

  async createRoom(room: ArenaRoom): Promise<void> {
    const key = `${this.PREFIX}${room.roomId}`;
    await redis.set(key, JSON.stringify(room), "EX", this.TTL);
    
    // Also track which users are in which room
    for (const userId of Object.keys(room.players)) {
      await redis.set(`${this.USER_ROOM_PREFIX}${userId}`, room.roomId, "EX", this.TTL);
    }
  }

  async getRoom(roomId: string): Promise<ArenaRoom | null> {
    const data = await redis.get(`${this.PREFIX}${roomId}`);
    if (!data) return null;
    return JSON.parse(data);
  }

  async saveRoom(room: ArenaRoom): Promise<void> {
    const key = `${this.PREFIX}${room.roomId}`;
    await redis.set(key, JSON.stringify(room), "EX", this.TTL);
  }

  async deleteRoom(roomId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    if (room) {
      for (const userId of Object.keys(room.players)) {
        await redis.del(`${this.USER_ROOM_PREFIX}${userId}`);
      }
    }
    await redis.del(`${this.PREFIX}${roomId}`);
  }

  async getUserCurrentRoomId(userId: string): Promise<string | null> {
    return redis.get(`${this.USER_ROOM_PREFIX}${userId}`);
  }

  async joinRoom(roomId: string, userId: string): Promise<void> {
    await redis.set(`${this.USER_ROOM_PREFIX}${userId}`, roomId, "EX", this.TTL);
  }

  async leaveRoom(userId: string): Promise<string | null> {
    const roomId = await this.getUserCurrentRoomId(userId);
    if (roomId) {
      await redis.del(`${this.USER_ROOM_PREFIX}${userId}`);
    }
    return roomId;
  }
}
