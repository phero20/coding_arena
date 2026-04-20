package hub

import (
	"arena/internal/models"
	"arena/internal/repository"
	"context"
	"encoding/json"
	"log/slog"
	"sync"

	"github.com/redis/go-redis/v9"
)

type Message struct {
	RoomID  string
	Payload models.ArenaWSMessage
}

type Hub struct {

	// Active connections: userId -> Client
	Clients map[string]*Client
	// Room memberships: roomId -> (userId -> Client)
	Rooms map[string]map[string]*Client
	
	Broadcast  chan Message
	Register   chan *Client
	Unregister chan *Client
	mu         sync.RWMutex

	Redis *redis.Client
	Repo  *repository.ArenaRepository
}

func NewHub(redis *redis.Client, repo *repository.ArenaRepository) *Hub {
	return &Hub{
		Clients:    make(map[string]*Client),
		Rooms:      make(map[string]map[string]*Client),
		Broadcast:  make(chan Message),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Redis:      redis,
		Repo:       repo,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			// If existing connection for this user, close the OLD one gracefully
			if oldClient, ok := h.Clients[client.UserID]; ok {
				slog.Info("Hub replacing old connection for user", "userId", client.UserID)
				// Note: We don't close its Send channel here because ReadPump's defer will handle it
				// but we do remove it from the map so broadcasts only go to the latest
				if oldClient.RoomID != "" {
					if clientsInRoom, ok := h.Rooms[oldClient.RoomID]; ok {
						delete(clientsInRoom, oldClient.UserID)
					}
				}
			}

			h.Clients[client.UserID] = client
			if h.Rooms[client.RoomID] == nil {
				h.Rooms[client.RoomID] = make(map[string]*Client)
			}
			h.Rooms[client.RoomID][client.UserID] = client
			h.mu.Unlock()
			slog.Info("Hub client registered", "userId", client.UserID, "roomId", client.RoomID)

		case client := <-h.Unregister:
			h.mu.Lock()
			// ONLY delete if this is the CURRENT client for this user
			if current, ok := h.Clients[client.UserID]; ok && current == client {
				delete(h.Clients, client.UserID)
				if clientsInRoom, ok := h.Rooms[client.RoomID]; ok {
					delete(clientsInRoom, client.UserID)
					if len(clientsInRoom) == 0 {
						delete(h.Rooms, client.RoomID)
					}
				}
				close(client.Send)
				slog.Info("Hub client unregistered (final)", "userId", client.UserID, "roomId", client.RoomID)
			} else {
				slog.Info("Hub stale unregister ignored", "userId", client.UserID)
			}
			h.mu.Unlock()

		case msg := <-h.Broadcast:
			h.mu.RLock()
			if clients, ok := h.Rooms[msg.RoomID]; ok {
				for _, client := range clients {
					select {
					case client.Send <- msg.Payload:
					default:
						// Buffer full, skip or handle
					}
				}
			}
			h.mu.RUnlock()
		}
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

		h.Broadcast <- Message{
			RoomID: update.RoomID,
			Payload: wsMsg,
		}
	}
}
