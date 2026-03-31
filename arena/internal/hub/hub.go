package hub

import (
	"context"
	"log"
	"sync"
	"arena/internal/models"
	"arena/internal/repository"
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
				log.Printf("[Hub] Replacing old connection for user: %s", client.UserID)
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
			log.Printf("[Hub] Client Registered: %s in room %s", client.UserID, client.RoomID)

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
				log.Printf("[Hub] Client Unregistered (Final): %s from room %s", client.UserID, client.RoomID)
			} else {
				log.Printf("[Hub] Stale Unregister Ignored: %s", client.UserID)
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

func (h *Hub) ListenForUpdates(ctx context.Context) {
	pubsub := h.Redis.Subscribe(ctx, "arena:room:updates")
	defer pubsub.Close()

	log.Println("[Hub] Listening for Redis room updates...")

	ch := pubsub.Channel()
	for msg := range ch {
		roomId := msg.Payload
		log.Printf("[Hub] Received update signal for room: %s", roomId)

		// Fetch latest room data
		room, err := h.Repo.GetRoom(ctx, roomId)
		if err != nil {
			log.Printf("[Hub] Error fetching room %s from Redis: %v", roomId, err)
			continue
		}

		if room != nil {
			// Broadcast the new state to everyone in the room
			h.Broadcast <- Message{
				RoomID: roomId,
				Payload: models.ArenaWSMessage{
					Type: "PROBLEM_CHANGED",
					Payload: map[string]interface{}{
						"room": room,
					},
				},
			}
		}
	}
}
