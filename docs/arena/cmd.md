# Arena `cmd` Layer

The entrypoint for the Go Microservice.

**File Location**: [arena/cmd/server/main.go](../../../arena/cmd/server/main.go)

## Responsibilities

1. **Bootstrap**: Loads environment variables from `.env` using `pkg/config`.
2. **Dependency Injection**: Initializes the Redis client, the `ArenaRepository`, the `ArenaService`, and finally the WebSocket `Hub`.
3. **Routing**: Sets up the HTTP server using `github.com/gorilla/mux`.
4. **Middleware**: Attaches CORS and Clerk Authentication middleware to protect the WebSocket handshake.
5. **Start**: Spawns the Hub's background goroutines (`go hub.Run()` and `go hub.ListenForUpdates()`) and begins listening on the configured port (default `8080`).
