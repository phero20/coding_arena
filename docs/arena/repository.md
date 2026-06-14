# Arena `repository` Layer

**File Location**: [arena/internal/repository/](../../../arena/internal/repository/)

## Responsibilities

Because Node.js, Go, and Background Workers are all interacting with the exact same multiplayer matches simultaneously, standard Redis `GET` and `SET` commands would cause massive race conditions (e.g., two people joining at the exact same millisecond).

To solve this, `redis.go` relies heavily on **Lua Scripts** to perform atomic transactions directly on the Redis server.

### Key Atomic Operations

1. **`AtomicJoinRoom`**: A Lua script that checks if the room exists, checks if the room has hit maximum capacity, checks if the match has already started, and if all conditions pass, inserts the user into the JSON payload in one atomic, unbreakable step.
2. **`AtomicStartMatch`**: Checks if the user requesting the start is the actual `hostId`, checks if all players are `ready`, and sets `status = PLAYING` atomically.
3. **`AtomicUpdateProgress`**: When a Node.js worker finishes evaluating code, this Lua script updates the player's tests passed, recalculates their score, sorts the leaderboard, and publishes the `arena:room:updates` event all in a single transaction.
