package hub

import (
	"log/slog"
	"sync"
	"time"
)

type Room struct {
	ID         string
	clients    map[string]*Client
	register   chan *Client
	unregister chan *Client
	broadcast  chan Message
	mu         sync.RWMutex
}

func NewRoom(id string) *Room {
	return &Room{
		ID:         id,
		clients:    make(map[string]*Client),
		register:   make(chan *Client, 32),
		unregister: make(chan *Client, 32),
		broadcast:  make(chan Message, 256),
	}
}

// Run executes the room's isolated event loop
func (r *Room) Run(hub *Hub) {
	// Cleanup ticker to prevent memory leaks if room stays empty
	ticker := time.NewTicker(2 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case client := <-r.register:
			r.mu.Lock()
			// If existing connection for this user, replace it
			if oldClient, ok := r.clients[client.UserID]; ok {
				slog.Info("Room replacing old connection for user", "userId", client.UserID, "roomId", r.ID)
				// The old client's ReadPump handles closing its own socket.
				delete(r.clients, oldClient.UserID)
			}
			r.clients[client.UserID] = client
			r.mu.Unlock()

			slog.Info("Room client registered", "userId", client.UserID, "roomId", r.ID)

		case client := <-r.unregister:
			r.mu.Lock()
			if current, ok := r.clients[client.UserID]; ok && current == client {
				delete(r.clients, client.UserID)
				close(client.Send)
				slog.Info("Room client unregistered (final)", "userId", client.UserID, "roomId", r.ID)
			} else {
				slog.Info("Room stale unregister ignored", "userId", client.UserID, "roomId", r.ID)
			}
			r.mu.Unlock()

			// Check if room is empty after unregister
			r.mu.RLock()
			isEmpty := len(r.clients) == 0
			r.mu.RUnlock()

			if isEmpty {
				// Signal hub to clean up the room mapping
				hub.CleanupRoom <- r.ID
				return // Terminate the room's goroutine
			}

		case msg := <-r.broadcast:
			r.mu.RLock()
			// Copy clients to avoid holding the lock during channel sends
			clientsCopy := make([]*Client, 0, len(r.clients))
			for _, client := range r.clients {
				clientsCopy = append(clientsCopy, client)
			}
			r.mu.RUnlock()

			for _, client := range clientsCopy {
				select {
				case client.Send <- msg.Payload:
				default:
					// Buffer is full; slow client. Trigger force-reconnect.
					if !client.IsUnhealthy {
						client.IsUnhealthy = true
						slog.Warn("Room dropping broadcast to client (buffer full) - Forcing reconnect", "userId", client.UserID)
						
						// Trigger explicit unregister to force the client to reconnect
						go func(c *Client) {
							time.Sleep(5 * time.Second)
							r.unregister <- c
							c.Conn.Close()
						}(client)
					}
				}
			}

		case <-ticker.C:
			r.mu.RLock()
			isEmpty := len(r.clients) == 0
			r.mu.RUnlock()

			if isEmpty {
				hub.CleanupRoom <- r.ID
				return // Terminate goroutine
			}
		}
	}
}
