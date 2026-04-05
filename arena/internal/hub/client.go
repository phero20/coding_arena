package hub

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	"arena/internal/models"
	"arena/internal/repository"
	"arena/internal/service"

	"github.com/gofiber/contrib/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512 * 1024 // 512KB for code progress updates
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
		// Handle automatic disconnection/status update
		ctx := context.Background()
		updatedRoom, _ := c.Service.HandleConnectionLoss(ctx, c.RoomID, c.UserID)
		
		if updatedRoom != nil {
			c.Hub.Broadcast <- Message{
				RoomID: c.RoomID,
				Payload: models.ArenaWSMessage{
					Type: "PLAYER_LEFT",
					Payload: map[string]interface{}{
						"room": updatedRoom,
					},
				},
			}
		}

		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		var msg models.ArenaWSMessage
		err := c.Conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				slog.Error("Client Read Error", "error", err, "userId", c.UserID, "roomId", c.RoomID)
			}
			break
		}

		// Handle Match Events
		ctx := context.Background()
		var updatedRoom *models.ArenaRoom
		var handleErr error

		switch msg.Type {
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
			slog.Error("Client Event Handle Error", "error", handleErr, "userId", c.UserID, "roomId", c.RoomID, "msgType", msg.Type)
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
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.Conn.WriteJSON(msg); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
