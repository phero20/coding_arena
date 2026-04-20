import { redis } from "../../libs/core/redis";
import { ArenaRoom, ArenaPlayer } from "../../types/arena/arena.types";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("arena-repository");

import { type ICradle } from "../../libs/awilix-container";

export class ArenaRepository {
  constructor(_: ICradle) {}

  private readonly PREFIX = "arena:room:";
  private readonly USER_ROOM_PREFIX = "arena:user:room:";
  private readonly TTL = 3600; // 1 hour for room lifetime

  async createRoom(room: ArenaRoom): Promise<void> {
    const key = `${this.PREFIX}${room.roomId}`;
    const pipeline = redis.pipeline();

    pipeline.set(key, JSON.stringify(room), "EX", this.TTL);

    // Batch user-to-room mappings
    for (const userId of Object.keys(room.players)) {
      pipeline.set(
        `${this.USER_ROOM_PREFIX}${userId}`,
        room.roomId,
        "EX",
        this.TTL,
      );
    }

    await pipeline.exec();
  }

  async getRoom(roomId: string): Promise<ArenaRoom | null> {
    const data = await redis.get(`${this.PREFIX}${roomId}`);
    if (!data) return null;
    return JSON.parse(data);
  }

  async getAllPlayingRooms(): Promise<ArenaRoom[]> {
    const keys = await redis.keys(`${this.PREFIX}*`);
    if (keys.length === 0) return [];

    const rawData = await redis.mget(...keys);
    const rooms: ArenaRoom[] = [];

    for (const data of rawData) {
      if (data) {
        try {
          const room = JSON.parse(data) as ArenaRoom;
          if (room.status === "PLAYING") rooms.push(room);
        } catch (e) {
          // Ignore parsing errors for dirty keys
        }
      }
    }
    return rooms;
  }

  async saveRoom(room: ArenaRoom): Promise<void> {
    const key = `${this.PREFIX}${room.roomId}`;
    await redis.set(key, JSON.stringify(room), "EX", this.TTL);
  }

  async deleteRoom(roomId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    if (!room) return;

    const pipeline = redis.pipeline();

    // Batch removals
    for (const userId of Object.keys(room.players)) {
      pipeline.del(`${this.USER_ROOM_PREFIX}${userId}`);
    }
    pipeline.del(`${this.PREFIX}${roomId}`);

    await pipeline.exec();
  }

  async getUserCurrentRoomId(userId: string): Promise<string | null> {
    return redis.get(`${this.USER_ROOM_PREFIX}${userId}`);
  }

  /**
   * Atomically joins a room.
   */
  async joinRoom(roomId: string, player: ArenaPlayer): Promise<void> {
    const script = `
      local roomKey = KEYS[1]
      local userKey = KEYS[2]
      local playerJson = ARGV[1]
      local userId = ARGV[2]
      local ttl = ARGV[3]

      local roomData = redis.call("get", roomKey)
      if not roomData then return nil end

      local room = cjson.decode(roomData)

      if room.players[userId] then
        local p = room.players[userId]
        p.isOffline = false
        room.players[userId] = p
        redis.call("set", roomKey, cjson.encode(room), "EX", ttl)
        redis.call("set", userKey, room.roomId, "EX", ttl)
        return "OK"
      end

      if room.status ~= "WAITING" then return "FULL_OR_PLAYING" end

      local newPlayer = cjson.decode(playerJson)
      newPlayer.isOffline = false
      room.players[userId] = newPlayer
      
      redis.call("set", roomKey, cjson.encode(room), "EX", ttl)
      redis.call("set", userKey, room.roomId, "EX", ttl)
      return "OK"
    `;

    const result = await redis.eval(
      script,
      2,
      `${this.PREFIX}${roomId}`,
      `${this.USER_ROOM_PREFIX}${player.userId}`,
      JSON.stringify(player),
      player.userId,
      this.TTL,
    );

    if (result === "FULL_OR_PLAYING")
      throw new Error("Room is not in WAITING status");
    if (!result) throw new Error("Room not found");

    logger.info({ roomId, userId: player.userId }, "Player joined arena room");
  }

  /**
   * Atomically leaves a room.
   */
  async leaveRoom(userId: string): Promise<string | null> {
    const script = `
      local userKey = KEYS[1]
      local roomId = redis.call("get", userKey)
      if not roomId then return nil end

      local roomKey = "arena:room:" .. roomId
      local roomData = redis.call("get", roomKey)
      
      if roomData then
        local room = cjson.decode(roomData)
        
        if room.status == "PLAYING" then
          if room.players[userId] then
            room.players[userId].status = "DISCONNECTED"
          end
          redis.call("set", roomKey, cjson.encode(room), "EX", 3600)
        else
          room.players[userId] = nil
          local hasPlayers = false
          for _ in pairs(room.players) do
            hasPlayers = true
            break
          end
          if not hasPlayers then
            redis.call("del", roomKey)
          else
            redis.call("set", roomKey, cjson.encode(room), "EX", 3600)
          end
        end
      end

      redis.call("del", userKey)
      return roomId
    `;

    const result = (await redis.eval(
      script,
      1,
      `${this.USER_ROOM_PREFIX}${userId}`,
    )) as string | null;
    return result;
  }

  /**
   * ATOMIC: Transitions the room to FINISHED status.
   */
  async finishRoom(roomId: string): Promise<void> {
    await this.updateRoomStatus(roomId, {
      status: "FINISHED",
      matchId: undefined,
      startTime: undefined,
      endTime: undefined,
    });
  }

  /**
   * ATOMIC: Resets the room metadata after a match finishes.
   */
  async resetRoom(roomId: string): Promise<void> {
    await this.updateRoomStatus(roomId, {
      status: "WAITING",
      matchId: undefined,
      startTime: undefined,
      endTime: undefined,
    });
  }

  /**
   * ATOMIC: Updates a single player's progress data within the room JSON.
   */
  async updateRoomPlayer(
    roomId: string,
    userId: string,
    updates: Partial<ArenaPlayer>,
  ): Promise<void> {
    const script = `
      local roomKey = KEYS[1]
      local userId = ARGV[1]
      local updatesJson = ARGV[2]
      local ttl = ARGV[3]

      local roomData = redis.call("get", roomKey)
      if not roomData then return nil end

      local room = cjson.decode(roomData)
      local updates = cjson.decode(updatesJson)

      if room.players[userId] then
        for k, v in pairs(updates) do
          room.players[userId][k] = v
        end
        redis.call("set", roomKey, cjson.encode(room), "EX", ttl)
        return "OK"
      end
      return "PLAYER_NOT_FOUND"
    `;

    const result = await redis.eval(
      script,
      1,
      `${this.PREFIX}${roomId}`,
      userId,
      JSON.stringify(updates),
      this.TTL,
    );

    if (result === "PLAYER_NOT_FOUND")
      throw new Error("Player not found in room");
    if (!result) throw new Error("Room not found");
  }

  /**
   * ATOMIC: Updates the room status and metadata safely.
   */
  async updateRoomStatus(
    roomId: string,
    updates: Partial<Omit<ArenaRoom, "players" | "roomId">>,
  ): Promise<void> {
    const script = `
        local roomKey = KEYS[1]
        local updatesJson = ARGV[1]
        local ttl = ARGV[2]

        local roomData = redis.call("get", roomKey)
        if not roomData then return nil end

        local room = cjson.decode(roomData)
        local updates = cjson.decode(updatesJson)

        for k, v in pairs(updates) do
            if v == "null" or v == nil then
                room[k] = nil
            else
                room[k] = v
            end
        end

        redis.call("set", roomKey, cjson.encode(room), "EX", ttl)
        return "OK"
    `;

    const result = await redis.eval(
      script,
      1,
      `${this.PREFIX}${roomId}`,
      JSON.stringify(updates),
      this.TTL,
    );

    if (!result) throw new Error("Room not found");
  }
}
