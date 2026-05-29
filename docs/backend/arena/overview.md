# Go Arena Hub: Architecture Overview

The Arena Hub is a high-performance WebSocket server written in **Go**. It is responsible for all real-time interactions during a competitive match.

## 🏗 High-Level Design

The server uses the **Fiber** web framework and is designed around a central **Hub** that manages multiple **Clients** and **Rooms**.

*   **Concurrency**: Every WebSocket connection runs in its own **Goroutine**.
*   **Synchronization**: State updates are handled via **Go Channels** (`Register`, `Unregister`, `Broadcast`) to avoid shared memory race conditions.
*   **Memory Efficiency**: The Hub maintains a lightweight mapping of `userId -> Client` and `roomId -> [userId]Client`.

## 🔄 The Hub Pattern (`internal/hub/`)

The Hub acts as the "Traffic Controller" for the WebSocket connections:

1.  **`Register` Channel**: When a user connects, the Hub maps their `userId` to their WebSocket connection. It gracefully closes any "Stale" connections if the same user joins from a different tab.
2.  **`ListenForUpdates`**: The Hub subscribes to the Redis channel `arena:room:updates`. When the Bun API changes a room (e.g., changing a problem), the Hub receives this event, fetches the latest data from Redis, and broadcasts it to all clients in that room.
3.  **`ReadPump` & `WritePump`**:
    *   **ReadPump**: Listens for messages *from* the user (e.g., heartbeats).
    *   **WritePump**: Sends messages *to* the user from the Hub's broadcast channel.

## 🔑 Authentication (Clerk PEM)

The Go Hub does not talk to the Bun API for authentication. Instead, it performs **Stateless JWT Validation** using a Clerk Public Key (PEM):

1.  The Hub loads the `CLERK_PEM_PUBLIC_KEY` from the environment.
2.  Every WebSocket connection must provide a JWT (via a cookie or header).
3.  The Go server locally verifies the JWT signature. If valid, the `userId` is extracted and used to identify the connection.
