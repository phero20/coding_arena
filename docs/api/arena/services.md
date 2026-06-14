# Arena Services

The Arena services orchestrate the high-concurrency, stateful logic required for multiplayer coding battles. These services use **Redis Distributed Locks** (`withLock`) and **MongoDB Transactions** (`withTransaction`) to prevent race conditions during high-speed submission events.

## 1. `ArenaService`

**File**: [api/src/services/arena/arena.service.ts](../../../api/src/services/arena/arena.service.ts)

Handles the "Lobby Phase" of the Arena. It manages room creation, configuration, and the pivotal transition into a live match.

### Key Flows:
- **`createRoom`**: Validates the creator, generates a unique 6-character hex `roomId`, and initializes the lobby in Redis.
- **`updateRoomProblem`**: Ensures the requester is the host, updates the selected problem in Redis, and publishes a `PROBLEM_CHANGED` event to the Go Hub via `matchBroadcaster`.
- **`startMatch`**: 
  1. Uses `withLock` to prevent double-clicks from spawning two matches.
  2. Creates a permanent `ArenaMatch` document in MongoDB with all current players initialized to 0 points.
  3. Re-initializes the Redis Room with `status: "PLAYING"` and sets the Start/End timers.
  4. Publishes a `MATCH_STARTED` event so the Go Hub knows to start the WebSocket clocks.

### Resilience (Sync-on-Read):
In `getRoom()`, if Redis reports the room is `PLAYING` but MongoDB reports `COMPLETED`, it triggers an automatic "Sync-on-Read" self-healing process to fix the Redis state.

---

## 2. `ArenaMatchService`

**File**: [api/src/services/arena/arena-match.service.ts](../../../api/src/services/arena/arena-match.service.ts)

Handles the "Active Phase" of the Arena. It processes code submissions, calculates progress, and safely finalizes matches.

### Key Flows:
- **`handleMatchSubmission`**: 
  - Locks specifically on the player `match:{matchId}:player:{userId}` to prevent concurrent submission spam.
  - Opens a MongoDB Transaction.
  - Calculates the score using `MatchDomainEngine`.
  - Updates the player's progress in MongoDB.
  - Updates the fast Redis room state.
  - Uses `arenaMatchRepository.countUnfinishedPlayers` to check if everyone is done. If so, triggers `finalizeMatch()`.
- **`finalizeMatch`**:
  - Uses `withLock("finishMatch:{roomId}")` to prevent the match from ending twice.
  - Uses an atomic DB update (`atomicMarkStatusCompleted`) to ensure idempotency.
  - Ranks players, calculates final scores (Survivor Pool Formula), updates PostgreSQL Stats, and triggers BullMQ `arenaCleanupQueue` to wipe the Redis room in 60 seconds.

---

## 3. `MatchDomainEngine`

**File**: [api/src/services/arena/match-domain-engine.service.ts](../../../api/src/services/arena/match-domain-engine.service.ts)

A pure-logic, stateless service (Domain Driven Design) that holds the mathematical rules of the game:
- **`calculateScore`**: `ACCEPTED` yields base points, `WRONG_ANSWER` yields 0.
- **`determineSubmissionOrder`**: Determines if a player was 1st, 2nd, or 3rd to submit successfully.
- **`rankPlayers`**: Sorts players by Score, then by Time Taken.

---

## 4. `MatchBroadcasterService`

**File**: [api/src/services/arena/match-broadcaster.service.ts](../../../api/src/services/arena/match-broadcaster.service.ts)

An abstraction over `ioredis` Publisher. It sends PubSub messages (e.g., `MATCH_OVER`, `LEADERBOARD_UPDATE`) that the Go Arena Hub listens to and relays to connected WebSocket clients.
