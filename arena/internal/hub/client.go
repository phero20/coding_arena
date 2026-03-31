package hub

import (
	"context"
	"encoding/json"
	"log"

	"arena/internal/models"
	"arena/internal/repository"
	"arena/internal/service"
	"github.com/gofiber/contrib/websocket"
)

type Client struct {
	Hub     *Hub
	Service *service.ArenaService
	Repo    *repository.ArenaRepository
	Conn    *websocket.Conn
	Send    chan models.ArenaWSMessage
	UserID  string
	RoomID  string
}

func (c *Client) ReadPump() {
	defer func() {
		// Just unregister and close. Don't delete room or remove player.
		// This allows for re-connections without nuking the arena.
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		var msg models.ArenaWSMessage
		err := c.Conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("[Client] Read Error: %v", err)
			}
			break
		}

		// Handle Match Events
		ctx := context.Background()
		var updatedRoom *models.ArenaRoom
		var handleErr error

		switch msg.Type {
		case "PLAYER_READY":
			// Safely parse bool from payload
			payloadBytes, _ := json.Marshal(msg.Payload)
			var ready bool
			if err := json.Unmarshal(payloadBytes, &ready); err == nil {
				updatedRoom, handleErr = c.Service.HandleReady(ctx, c.RoomID, c.UserID, ready)
			}
		case "PROGRESS_UPDATE":
			// Safely parse progress from payload
			payloadBytes, _ := json.Marshal(msg.Payload)
			var progress struct {
				TestsPassed int `json:"testsPassed"`
				TotalTests  int `json:"totalTests"`
			}
			if err := json.Unmarshal(payloadBytes, &progress); err == nil {
				updatedRoom, handleErr = c.Service.HandleProgressUpdate(ctx, c.RoomID, c.UserID, progress.TestsPassed, progress.TotalTests)
			}
		case "START_MATCH":
			updatedRoom, handleErr = c.Service.HandleStartMatch(ctx, c.RoomID, c.UserID)
			if handleErr == nil {
				// Special case: change broadcast type to MATCH_STARTED
				msg.Type = "MATCH_STARTED"
			}
		case "LEAVE_ROOM":
			var wasDeleted bool
			updatedRoom, wasDeleted, handleErr = c.Service.HandleExplicitLeave(ctx, c.RoomID, c.UserID)
			if wasDeleted {
				c.Hub.Broadcast <- Message{
					RoomID: c.RoomID,
					Payload: models.ArenaWSMessage{
						Type:    "ERROR",
						Payload: "Host has left. Arena terminated.",
					},
				}
				return // Stop reading for this client
			}
			msg.Type = "PLAYER_LEFT"
		case "SYNC_PROBLEM":
			updatedRoom, handleErr = c.Repo.GetRoom(ctx, c.RoomID)
			msg.Type = "PROBLEM_CHANGED"
		default:
			// Just broadcast other message types as is
			c.Hub.Broadcast <- Message{RoomID: c.RoomID, Payload: msg}
			continue
		}

		if handleErr != nil {
			log.Printf("[Client] Event Handle Error: %v", handleErr)
			continue
		}

		// If room was updated, broadcast the new state
		if updatedRoom != nil {
			c.Hub.Broadcast <- Message{
				RoomID: c.RoomID,
				Payload: models.ArenaWSMessage{
					Type: msg.Type, // Echo back the type (e.g., PLAYER_READY)
					Payload: map[string]interface{}{
						"room": updatedRoom,
					},
				},
			}
		}
	}
}

func (c *Client) WritePump() {
	for msg := range c.Send {
		if c.Conn == nil {
			break
		}
		err := c.Conn.WriteJSON(msg)
		if err != nil {
			// log.Printf("[Client] Write Error: %v", err)
			break
		}
	}
	if c.Conn != nil {
		c.Conn.Close()
	}
}
