package handlers

import (
	"context"
	"log/slog" // Changed from "log"

	// "log" // Removed

	"strings"
	"arena/internal/hub"
	"arena/internal/models"
	"arena/internal/repository"
	"arena/internal/service"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

func ArenaHandler(h *hub.Hub, s *service.ArenaService, r *repository.ArenaRepository) fiber.Handler {
	if h == nil || s == nil || r == nil {
		slog.Error("[WS] ArenaHandler initialized with nil dependencies!") // Changed from log.Fatal
	}

	return websocket.New(func(c *websocket.Conn) {
		slog.Info("WS connection handshake successful", "remoteAddr", c.RemoteAddr().String()) // Changed from log.Printf
		
		// Panic Recovery for this specific connection
		defer func() {
			if r := recover(); r != nil {
				slog.Error("WS Panic Recovered", "panic", r) // Changed from log.Printf
			}
			c.Close() // Added c.Close() here as per instruction
		}()

		roomId := strings.ToUpper(c.Params("roomId"))
		
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

		slog.Info("WS Connection Attempt", "roomId", roomId, "userId", userId, "authMethod", authMethod) // Changed from log.Printf

		if roomId == "" || userId == "" {
			slog.Warn("WS Rejected: Missing roomId or userId") // Changed from log.Println
			c.WriteJSON(models.ArenaWSMessage{
				Type:    "ERROR",
				Payload: "Authentication failed: missing ID",
			})
			c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(4004, "Authentication failed"))
			return
		}

		// Handle Join Logic (Persists in Redis)
		room, isNewPlayer, err := s.HandleJoin(context.Background(), roomId, userId, username, avatarUrl)
		if err != nil {
			slog.Error("WS Join Error", "userId", userId, "error", err) // Changed from log.Printf
			c.WriteJSON(models.ArenaWSMessage{
				Type:    "ERROR",
				Payload: err.Error(),
			})
			c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(4004, "Room Not Found or Join Failed"))
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
