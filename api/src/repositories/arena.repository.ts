import { redis } from "../libs/redis";
import { ArenaRoom, ArenaPlayer } from "../types/arena.types";

export class ArenaRepository {
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
   * Updates room JSON with new player and sets user mapping.
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

      -- 1. Handling Re-entry (Sync offline state)
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
  }

  /**
   * Atomically leaves a room.
   * Removes player from room JSON and deletes user mapping.
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
          -- Soft Leave: Mark as disconnected instead of removing
          if room.players[userId] then
            room.players[userId].status = "DISCONNECTED"
          end
          redis.call("set", roomKey, cjson.encode(room), "EX", 3600)
        else
          -- Lobby Phase: Total removal
          room.players[userId] = nil
          
          -- Check if room is empty
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
   * Transitions the room to FINISHED status.
   * Keeps player data intact for final results display.
   */
  async finishRoom(roomId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    if (!room) return;

    room.status = "FINISHED";
    delete room.matchId;
    delete room.startTime;

    await this.saveRoom(room);
  }

  /**
   * Resets the room metadata after a match finishes.
   * Player statuses and scores are PRESERVED so they remain visible in the results.
   * They will be fully reset the next time a match is started.
   */
  async resetRoom(roomId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    if (!room) return;

    room.status = "WAITING";
    delete room.matchId;
    delete room.startTime;

    await this.saveRoom(room);
  }
}
