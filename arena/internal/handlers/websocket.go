package handlers

import (
	"context"
	"log"

	"arena/internal/hub"
	"arena/internal/models"
	"arena/internal/repository"
	"arena/internal/service"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

func ArenaHandler(h *hub.Hub, s *service.ArenaService, r *repository.ArenaRepository) fiber.Handler {
	if h == nil || s == nil || r == nil {
		log.Fatal("[WS] ArenaHandler initialized with nil dependencies!")
	}

	return websocket.New(func(c *websocket.Conn) {
		log.Printf("[WS] Connection Handshake Successful: %s", c.RemoteAddr().String())
		
		// Panic Recovery for this specific connection
		defer func() {
			if r := recover(); r != nil {
				log.Printf("[WS] PANIC RECOVERED inside connection: %v", r)
			}
		}()

		roomId := c.Params("roomId")
		
		// Get userId from middleware context (Verified JWT)
		rawUserId := c.Locals("userId")
		userId, ok := rawUserId.(string)
		
		authMethod := "JWT"
		if !ok || userId == "" {
			// Fallback to query param for local development
			userId = c.Query("userId")
			authMethod = "QUERY"
		}

		username := c.Query("username")
		if username == "" {
			username = "Stranger"
		}
		avatarUrl := c.Query("avatarUrl")

		log.Printf("[WS] Connection Attempt: Room=%s, User=%s (Method=%s)", roomId, userId, authMethod)

		if roomId == "" || userId == "" {
			log.Println("[WS] Rejected: Missing roomId or userId")
			c.WriteJSON(models.ArenaWSMessage{
				Type:    "ERROR",
				Payload: "Authentication failed: missing ID",
			})
			c.Close()
			return
		}

		// Handle Join Logic (Persists in Redis)
		room, isNewPlayer, err := s.HandleJoin(context.Background(), roomId, userId, username, avatarUrl)
		if err != nil {
			log.Printf("[WS] Join Error for User %s: %v", userId, err)
			c.WriteJSON(models.ArenaWSMessage{
				Type:    "ERROR",
				Payload: err.Error(),
			})
			c.Close()
			return
		}

		// Create Client
		client := &hub.Client{
			Hub:     h,
			Service: s,
			Repo:    r,
			Conn:    c,
			Send:    make(chan models.ArenaWSMessage, 256),
			UserID:  userId,
			RoomID:  roomId,
		}

		// Register Client with Hub (Memory)
		h.Register <- client

		// IMMEDIATE SYNC: Send the current room state directly to the client
		c.WriteJSON(models.ArenaWSMessage{
			Type: "PLAYER_JOINED", 
			Payload: map[string]interface{}{
				"room": room,
			},
		})

		// Only broadcast to OTHERS if it's a truly new player
		if isNewPlayer {
			h.Broadcast <- hub.Message{
				RoomID: roomId,
				Payload: models.ArenaWSMessage{
					Type: "PLAYER_JOINED",
					Payload: map[string]interface{}{
						"room": room,
					},
				},
			}
		}

		// Start Pumps
		go client.WritePump()
		client.ReadPump()
	}, websocket.Config{
		Origins: []string{},
	})
}
