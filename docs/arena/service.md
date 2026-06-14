# Arena `service` Layer

**File Location**: [arena/internal/service/](../../../arena/internal/service/)

## Responsibilities

Contains the core business logic (`arena_service.go`) triggered by client messages. It orchestrates changes to the game state but relies on the `Repository` to ensure those changes are thread-safe across a distributed system.

- **`HandleJoin`**: Adds a player to a room's roster.
- **`HandleReady`**: Toggles a player's ready state.
- **`HandleStartMatch`**: Validates that all players are ready, locks the room from new joins, and triggers the countdown.
- **`HandleConnectionLoss`**: Differentiates between a player disconnecting in the lobby (removes them completely) vs disconnecting mid-match (leaves their avatar visible but marks them `IsOffline = true`).
- **`HandleExplicitLeave`**: Handles users intentionally clicking the "Leave Match" button.
