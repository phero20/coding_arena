# Arena Repositories & State Management

The Arena module operates under intense read/write pressure during live multiplayer matches. To handle this without locking up the database, it utilizes a dual-layer approach: **Redis** for ultra-fast, ephemeral room state, and **MongoDB** for complex, persistent match history.

## 1. `ArenaRepository` (Redis State)

**File**: [api/src/repositories/arena/arena.repository.ts](../../../api/src/repositories/arena/arena.repository.ts)

This repository interfaces directly with Redis. It manages the "Waiting Room" (Lobby) phase. 

### Key Features:
- **Atomic Operations**: Uses Lua scripts (`redis.eval`) for `joinRoom` and `leaveRoom` to guarantee thread-safe operations. For example, joining a room evaluates if the room is still `WAITING` before allowing the player in.
- **TTL**: Rooms automatically expire after 1 hour (`TTL = 3600`) to prevent memory leaks from abandoned lobbies.
- **Bi-Directional Mapping**: Maintains both the room JSON (`arena:room:{roomId}`) and a reverse lookup for users (`arena:user:room:{userId}`) so a user can be routed back to their room on refresh.

---

## 2. `ArenaMatchRepository` (MongoDB Persistence)

**File**: [api/src/repositories/arena/arena-match.repository.ts](../../../api/src/repositories/arena/arena-match.repository.ts)

When a match starts, it transitions from the ephemeral Redis state into a permanent `ArenaMatch` document in MongoDB.

### Key Features:
- **Optimistic Concurrency Control**: Uses an atomic transition `atomicMarkStatusCompleted` to ensure that a `PLAYING` match is only finalized exactly once, even if multiple webhooks try to end the match simultaneously.
- **Complex Aggregations**: The `findByIdWithSubmissions` method uses a deeply nested MongoDB Aggregation Pipeline (`$lookup`, `$unwind`, `$addFields`) to join the Match document, the `ArenaSubmission` link records, and the massive `Submission` source-code records into a single formatted payload.
- **Partial Updates**: Uses specific array filters (`arrayFilters: [{ "player.userId": userId }]`) to update a single player's score without overwriting the entire match document.
- **Projection Optimization**: Methods like `countUnfinishedPlayers` use MongoDB `$project` and `$size` to count pending players inside the database engine, avoiding massive data transfers over the wire during high-speed submission checks.

---

## 3. `ArenaSubmissionRepository` (MongoDB Linking)

**File**: [api/src/repositories/arena/arena-submission.repository.ts](../../../api/src/repositories/arena/arena-submission.repository.ts)

A lightweight repository that tracks the specific code submissions made *within the context of an Arena match*. This allows the system to differentiate between a user practicing a problem solo versus solving it during a battle.
