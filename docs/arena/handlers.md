# Arena `handlers` Layer

**File Location**: [arena/internal/handlers/](../../../arena/internal/handlers/)

## Responsibilities

Contains `websocket.go`, which exposes the `ServeWS` function.

1. **Upgrade**: Takes a standard HTTP GET request and upgrades it to a persistent WebSocket connection using `gorilla/websocket`.
2. **Context Passing**: Extracts the `userID` from the HTTP context (injected by the Clerk authentication middleware) and binds it to the newly created WebSocket `Client`.
3. **Registration**: Passes the client to the `Hub` to be fully registered, then spawns the `readPump` and `writePump` goroutines for that specific user.
