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
