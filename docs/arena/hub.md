# Arena `hub` Layer

This is the most critical and complex layer of the Go Microservice. It manages all active WebSocket connections and broadcasts messages to the correct players without causing race conditions.

**File Location**: [arena/internal/hub/](../../../arena/internal/hub/)

## 1. `hub.go`
The `Hub` maintains a central registry of all active `Rooms`.
- **`Run()`**: A continuous `for-select` loop that processes requests to register new rooms or clean up empty ones.
- **`ListenForUpdates()`**: Subscribes to the `arena:room:updates` Redis Pub/Sub channel. When the Node.js worker evaluates a submission, it publishes an event here. The Hub intercepts this, fetches the fresh state from Redis, and broadcasts a `LEADERBOARD_UPDATE` to all players in the affected room.

## 2. `room.go`
A `Room` represents an isolated group of WebSockets (the players in a specific match).
- Every room runs in its own lightweight Goroutine.
- It maintains a map of `clients`.
- It processes local broadcasts securely, ensuring that a slow network on one player's client doesn't block updates for the other players.

## 3. `client.go`
A wrapper around the raw `*websocket.Conn`.
- **`readPump()`**: Continuously reads messages from the frontend (like "Join Room", "Start Match") and routes them to the `ArenaService`.
- **`writePump()`**: Continuously drains the client's outgoing message channel, sending JSON payloads back over the network. Uses Ping/Pong frames to detect dead connections and aggressively cull them to save memory.
