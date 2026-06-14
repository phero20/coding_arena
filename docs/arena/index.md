# Arena Microservice Overview

The **Arena Microservice** is a standalone, highly concurrent WebSocket server written in Go. It powers the real-time multiplayer "Arena" mode where users race to solve coding problems. 

## Why Go?

Unlike the main API which is written in Node.js, this specific module requires managing thousands of persistent WebSocket connections concurrently, while maintaining sub-millisecond synchronization of game states (who solved what, when). Go's lightweight goroutines and excellent concurrency primitives (Channels, Mutexes) make it uniquely suited for this task.

## Architecture

The service follows a standard Go project layout:

```text
arena/
├── cmd/
│   └── server/          # Application Entrypoint
├── internal/
│   ├── handlers/        # WebSocket upgrading and HTTP routing
│   ├── hub/             # The core concurrency engine managing connections
│   ├── models/          # Data structures
│   ├── repository/      # Redis Lua scripts for atomic state changes
│   └── service/         # Business logic (joining, leaving, kicking)
├── pkg/
│   ├── config/          # Environment variables
│   └── redis/           # Database connection pooling
└── go.mod
```

## Documentation Layers

To explore the exact implementation details of the Go Microservice, please see the specific layer documentation:

- [cmd](./cmd.md): Application Entrypoint
- [hub](./hub.md): The Concurrency Engine
- [handlers](./handlers.md): WebSocket Upgrades
- [service](./service.md): Match Business Logic
- [repository](./repository.md): Redis Atomic Operations
- [pkg](./pkg.md): Shared Infrastructure
