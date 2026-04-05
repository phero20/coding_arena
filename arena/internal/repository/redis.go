package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"arena/internal/models"
	"github.com/redis/go-redis/v9"
)

type ArenaRepository struct {
	redis          *redis.Client
	prefix         string
	userRoomPrefix string
	ttl            time.Duration
}

func NewArenaRepository(client *redis.Client) *ArenaRepository {
	return &ArenaRepository{
		redis:          client,
		prefix:         "arena:room:",
		userRoomPrefix: "arena:user:room:",
		ttl:            3600 * time.Second,
	}
}

func (r *ArenaRepository) GetRoom(ctx context.Context, roomId string) (*models.ArenaRoom, error) {
	roomId = strings.ToUpper(roomId)
	data, err := r.redis.Get(ctx, r.prefix+roomId).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	var room models.ArenaRoom
	if err := json.Unmarshal([]byte(data), &room); err != nil {
		return nil, err
	}
	return &room, nil
}

func (r *ArenaRepository) SaveRoom(ctx context.Context, room *models.ArenaRoom) error {
	room.RoomID = strings.ToUpper(room.RoomID)
	data, err := json.Marshal(room)
	if err != nil {
		return err
	}

	return r.redis.Set(ctx, r.prefix+room.RoomID, data, r.ttl).Err()
}

// AtomicJoinRoom adds a player to the room atomically using Lua
func (r *ArenaRepository) AtomicJoinRoom(ctx context.Context, roomId string, player models.ArenaPlayer) (*models.ArenaRoom, error) {
	roomId = strings.ToUpper(roomId)
	playerData, err := json.Marshal(player)
	if err != nil {
		return nil, err
	}

	script := `
		local roomData = redis.call('GET', KEYS[1])
		if not roomData then return nil end
		local room = cjson.decode(roomData)
		
		-- Ensure players map exists
		if not room.players then room.players = {} end
		
		-- 1. Check if player already exists (Allows reconnection regardless of status)
		if room.players[ARGV[1]] then 
			local p = room.players[ARGV[1]]
			p.isOffline = false
			room.players[ARGV[1]] = p
			local updatedData = cjson.encode(room)
			redis.call('SET', KEYS[1], updatedData, 'PX', ARGV[3])
			return updatedData
		end
		
		-- 2. Check room status (Must be WAITING for NEW players to join)
		if room.status ~= "WAITING" then return {err = "INVALID_STATUS"} end
		
		-- 3. Check capacity (industry standard count)
		local count = 0
		for _ in pairs(room.players) do count = count + 1 end
		if count >= 50 then return {err = "ROOM_FULL"} end
		
		-- Add player
		room.players[ARGV[1]] = cjson.decode(ARGV[2])
		
		local updatedData = cjson.encode(room)
		redis.call('SET', KEYS[1], updatedData, 'PX', ARGV[3])
		redis.call('SET', KEYS[2], ARGV[4], 'PX', ARGV[3])
		return updatedData
	`

	res, err := r.redis.Eval(ctx, script, []string{
		r.prefix + roomId,
		r.userRoomPrefix + player.UserID,
	}, player.UserID, playerData, int(r.ttl.Milliseconds()), roomId).Result()

	if err != nil {
		if strings.Contains(err.Error(), "ROOM_FULL") {
			return nil, fmt.Errorf("room is full")
		}
		if strings.Contains(err.Error(), "INVALID_STATUS") {
			return nil, fmt.Errorf("room is not in WAITING status")
		}
		return nil, err
	}

	if res == nil {
		return nil, fmt.Errorf("room not found")
	}

	var updatedRoom models.ArenaRoom
	if err := json.Unmarshal([]byte(res.(string)), &updatedRoom); err != nil {
		return nil, err
	}

	return &updatedRoom, nil
}

// AtomicUpdateProgress updates player progress atomically using Lua
func (r *ArenaRepository) AtomicUpdateProgress(ctx context.Context, roomId, userId string, testsPassed, totalTests int) (*models.ArenaRoom, error) {
	roomId = strings.ToUpper(roomId)

	script := `
		local roomData = redis.call('GET', KEYS[1])
		if not roomData then return nil end
		local room = cjson.decode(roomData)
		
		if not room.players or not room.players[ARGV[1]] then
			return {err = "PLAYER_NOT_FOUND"}
		end

		-- Check room status (Must be PLAYING)
		if room.status ~= "PLAYING" then return {err = "INVALID_STATUS"} end
		
		local player = room.players[ARGV[1]]
		player.testsPassed = tonumber(ARGV[2])
		player.totalTests = tonumber(ARGV[3])
		
		-- Calculate score
		if player.totalTests > 0 then
			player.score = math.floor((player.testsPassed * 100) / player.totalTests)
		end
		
		room.players[ARGV[1]] = player
		
		local updatedData = cjson.encode(room)
		redis.call('SET', KEYS[1], updatedData, 'PX', ARGV[4])
		return updatedData
	`

	res, err := r.redis.Eval(ctx, script, []string{r.prefix + roomId}, userId, testsPassed, totalTests, int(r.ttl.Milliseconds())).Result()

	if err != nil {
		if strings.Contains(err.Error(), "PLAYER_NOT_FOUND") {
			return nil, fmt.Errorf("player not found in room")
		}
		if strings.Contains(err.Error(), "INVALID_STATUS") {
			return nil, fmt.Errorf("room is not in PLAYING status")
		}
		return nil, err
	}

	if res == nil {
		return nil, fmt.Errorf("room not found")
	}

	var updatedRoom models.ArenaRoom
	if err := json.Unmarshal([]byte(res.(string)), &updatedRoom); err != nil {
		return nil, err
	}

	return &updatedRoom, nil
}

// AtomicStartMatch transitions the room to StatusPlaying atomically using Lua
func (r *ArenaRepository) AtomicStartMatch(ctx context.Context, roomId, userId string) (*models.ArenaRoom, error) {
	roomId = strings.ToUpper(roomId)
	now := time.Now().Unix()

	script := `
		local roomData = redis.call('GET', KEYS[1])
		if not roomData then return nil end
		local room = cjson.decode(roomData)
		
		-- 1. Verify existence of players
		if not room.players then return {err = "ROOM_EMPTY"} end
		
		-- 2. Verify requester is creator
		local player = room.players[ARGV[1]]
		if not player or not player.isCreator then
			return {err = "NOT_CREATOR"}
		end
		
		-- 3. Verify status is WAITING (or LOBBY)
		if room.status ~= "WAITING" and room.status ~= "LOBBY" then
			return {err = "ALREADY_STARTED"}
		end
		
		-- 4. Check player count (minimum 2)
		local count = 0
		for _ in pairs(room.players) do count = count + 1 end
		if count < 2 then return {err = "NOT_ENOUGH_PLAYERS"} end
		
		-- 5. Transition status and reset offline state
		room.status = "PLAYING"
		room.startTime = tonumber(ARGV[2]) * 1000 -- Store as ms for JS compatibility
		
		for _, p in pairs(room.players) do
			p.isOffline = false
		end

		local updatedData = cjson.encode(room)
		redis.call('SET', KEYS[1], updatedData, 'PX', ARGV[3])
		return updatedData
	`

	res, err := r.redis.Eval(ctx, script, []string{r.prefix + roomId}, userId, now, int(r.ttl.Milliseconds())).Result()

	if err != nil {
		switch {
		case strings.Contains(err.Error(), "ROOM_EMPTY"):
			return nil, fmt.Errorf("room is empty")
		case strings.Contains(err.Error(), "NOT_CREATOR"):
			return nil, fmt.Errorf("only creator can start the match")
		case strings.Contains(err.Error(), "ALREADY_STARTED"):
			return nil, fmt.Errorf("match already started or finished")
		case strings.Contains(err.Error(), "NOT_ENOUGH_PLAYERS"):
			return nil, fmt.Errorf("not enough players to start")
		default:
			return nil, err
		}
	}

	if res == nil {
		return nil, fmt.Errorf("room not found")
	}

	var updatedRoom models.ArenaRoom
	if err := json.Unmarshal([]byte(res.(string)), &updatedRoom); err != nil {
		return nil, err
	}

	return &updatedRoom, nil
}

func (r *ArenaRepository) DeleteRoom(ctx context.Context, roomId string) error {
	roomId = strings.ToUpper(roomId)
	room, err := r.GetRoom(ctx, roomId)
	if err != nil {
		return err
	}

	// Clean up user mappings
	if room != nil {
		for userId := range room.Players {
			r.redis.Del(ctx, r.userRoomPrefix+userId)
		}
	}

	return r.redis.Del(ctx, r.prefix+roomId).Err()
}

// Connection tracking
func (r *ArenaRepository) IncrementConnection(ctx context.Context, roomId, userId string) (int64, error) {
	roomId = strings.ToUpper(roomId)
	key := fmt.Sprintf("%s%s:conn:%s", r.prefix, roomId, userId)
	count, err := r.redis.Incr(ctx, key).Result()
	if err != nil {
		return 0, err
	}
	r.redis.Expire(ctx, key, 60*time.Second)
	return count, nil
}

func (r *ArenaRepository) DecrementConnection(ctx context.Context, roomId, userId string) (int64, error) {
	roomId = strings.ToUpper(roomId)
	key := fmt.Sprintf("%s%s:conn:%s", r.prefix, roomId, userId)
	count, err := r.redis.Decr(ctx, key).Result()
	if err != nil {
		return 0, err
	}
	if count <= 0 {
		r.redis.Del(ctx, key)
		return 0, nil
	}
	return count, nil
}

func (r *ArenaRepository) GetConnections(ctx context.Context, roomId, userId string) (int64, error) {
	roomId = strings.ToUpper(roomId)
	key := fmt.Sprintf("%s%s:conn:%s", r.prefix, roomId, userId)
	val, err := r.redis.Get(ctx, key).Int64()
	if err == redis.Nil {
		return 0, nil
	}
	return val, err
}

