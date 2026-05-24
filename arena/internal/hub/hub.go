package hub

import (
	"arena/internal/models"
	"arena/internal/repository"
	"context"
	"encoding/json"
	"log/slog"
	"sync"

	"github.com/redis/go-redis/v9"
	"golang.org/x/sync/semaphore"
)

type Message struct {
	RoomID  string
	Payload models.ArenaWSMessage
}

type RegisterRoomRequest struct {
	Client *Client
	RoomID string
}

type Hub struct {
	rooms        map[string]*Room
	RegisterRoom chan *RegisterRoomRequest
	CleanupRoom  chan string
	mu           sync.RWMutex
	GoroutineSem *semaphore.Weighted

	Redis *redis.Client
	Repo  *repository.ArenaRepository
}

func NewHub(redis *redis.Client, repo *repository.ArenaRepository) *Hub {
	return &Hub{
		rooms:        make(map[string]*Room),
		RegisterRoom: make(chan *RegisterRoomRequest, 32),
		CleanupRoom:  make(chan string, 32),
		GoroutineSem: semaphore.NewWeighted(20000), // Max 20K goroutines
		Redis:        redis,
		Repo:         repo,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case req := <-h.RegisterRoom:
			h.mu.Lock()
			room, exists := h.rooms[req.RoomID]
			if !exists {
				room = NewRoom(req.RoomID)
				h.rooms[req.RoomID] = room
				go room.Run(h)
				slog.Info("Hub created new room goroutine", "roomId", req.RoomID)
			}
			h.mu.Unlock()

			// Forward the client to the specific room's register channel
			room.register <- req.Client

		case roomID := <-h.CleanupRoom:
			h.mu.Lock()
			// Double check if room is still empty before deleting
			if room, exists := h.rooms[roomID]; exists {
				room.mu.RLock()
				isEmpty := len(room.clients) == 0
				room.mu.RUnlock()

				if isEmpty {
					delete(h.rooms, roomID)
					slog.Info("Hub cleaned up empty room", "roomId", roomID)
				}
			}
			h.mu.Unlock()
		}
	}
}

// BroadcastToRoom sends a message to a specific room without blocking the entire Hub
func (h *Hub) BroadcastToRoom(roomID string, msg Message) {
	h.mu.RLock()
	room, exists := h.rooms[roomID]
	h.mu.RUnlock()

	if !exists {
		return
	}

	// Non-blocking send to room's broadcast channel
	select {
	case room.broadcast <- msg:
	default:
		slog.Warn("Hub failed to forward broadcast to room (buffer full)", "roomId", roomID)
	}
}

// UnregisterFromRoom removes a client from a specific room
func (h *Hub) UnregisterFromRoom(roomID string, client *Client) {
	h.mu.RLock()
	room, exists := h.rooms[roomID]
	h.mu.RUnlock()

	if !exists {
		return
	}

	select {
	case room.unregister <- client:
	default:
		slog.Warn("Hub failed to forward unregister to room (buffer full)", "roomId", roomID)
	}
}

type RedisUpdate struct {
	RoomID string      `json:"roomId"`
	Type   string      `json:"type"`
	Payload interface{} `json:"payload"`
}

func (h *Hub) ListenForUpdates(ctx context.Context) {
	pubsub := h.Redis.Subscribe(ctx, "arena:room:updates")
	defer pubsub.Close()

	slog.Info("Hub listening for Redis room updates", "mode", "JSON")

	ch := pubsub.Channel()
	for msg := range ch {
		var update RedisUpdate
		err := json.Unmarshal([]byte(msg.Payload), &update)
		if err != nil {
			slog.Warn("Hub error unmarshaling Redis message (attempting legacy roomId)", "error", err)
			// Fallback: If not JSON, it might be just the roomId string
			update.RoomID = msg.Payload
			update.Type = "PROBLEM_CHANGED"
		}

		slog.Info("Hub received update for room", "type", update.Type, "roomId", update.RoomID)

		// 1. Fetch latest room data to keep Hub sync'd
		room, err := h.Repo.GetRoom(ctx, update.RoomID)
		if err != nil {
			slog.Error("Hub error fetching room", "roomId", update.RoomID, "error", err)
			continue
		}

		if room == nil {
			slog.Warn("Hub room not found in Redis, skipping broadcast", "roomId", update.RoomID)
			continue
		}

		// 2. Broadcast based on type
		var wsMsg models.ArenaWSMessage

		switch update.Type {
		case "LEADERBOARD_UPDATE":
			wsMsg = models.ArenaWSMessage{
				Type: "LEADERBOARD_UPDATE",
				Payload: map[string]interface{}{
					"room": room,
				},
			}
		case "MATCH_STARTED":
			// Extract matchId from payload if possible
			var matchId string
			if payloadMap, ok := update.Payload.(map[string]interface{}); ok {
				if mId, exists := payloadMap["matchId"].(string); exists {
					matchId = mId
				}
			}

			wsMsg = models.ArenaWSMessage{
				Type: "MATCH_STARTED",
				Payload: map[string]interface{}{
					"room":    room,
					"matchId": matchId,
				},
			}
		case "MATCH_OVER":
			wsMsg = models.ArenaWSMessage{
				Type:    "MATCH_OVER",
				Payload: update.Payload,
			}
		default: // PROBLEM_CHANGED or others
			wsMsg = models.ArenaWSMessage{
				Type: "PROBLEM_CHANGED",
				Payload: map[string]interface{}{
					"room": room,
				},
			}
		}

		h.BroadcastToRoom(update.RoomID, Message{
			RoomID: update.RoomID,
			Payload: wsMsg,
		})
	}
}

type ConnectionMetrics struct {
	TotalConnections int `json:"totalConnections"`
	SlowClients      int `json:"slowClients"`
}

func (h *Hub) GetMetrics() ConnectionMetrics {
	h.mu.RLock()
	defer h.mu.RUnlock()

	metrics := ConnectionMetrics{
		TotalConnections: 0,
		SlowClients:      0,
	}

	for _, room := range h.rooms {
		room.mu.RLock()
		metrics.TotalConnections += len(room.clients)
		for _, client := range room.clients {
			if client.IsUnhealthy {
				metrics.SlowClients++
			}
		}
		room.mu.RUnlock()
	}

	return metrics
}
