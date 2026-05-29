# Go Hub: Redis & Atomic Lua Logic

To handle high-concurrency competitive matches, the Go Hub uses **Atomic Lua Scripts** executed directly inside Redis. This guarantees that operations like "Starting a Match" or "Joining a Room" are thread-safe across multiple server instances.

## ⚛️ Why Lua?

In a distributed system, a simple "Read-Modify-Write" cycle can lead to race conditions.
*   *Example*: Two users join a room with 1 spot left at the exact same millisecond. 
*   *Lua Solution*: The check and the increment happen in a single, atomic step inside Redis.

## 📜 Key Atomic Operations (`internal/repository/redis.go`)

### 1. `AtomicJoinRoom`
Handles both new player joins and existing player reconnections.
*   **Logic**:
    1.  Decodes the room JSON from Redis.
    2.  If the player already exists, it marks them as `isOffline = false` (Reconnection).
    3.  If the player is new, it checks if the status is `WAITING` and if the count is `< 50`.
    4.  Encodes and saves the room back to Redis.
*   **Return**: The updated Room JSON.

### 2. `AtomicStartMatch`
Transitions a lobby into a live competition.
*   **Safety Checks**:
    1.  Verifies the requester is the **Room Creator**.
    2.  Verifies the room has at least **2 players**.
    3.  Verifies the status is `WAITING`.
*   **Action**: Sets `status = "PLAYING"`, initializes `startTime` and `endTime` (based on `matchDuration`), and broadcasts the change.

### 3. `AtomicUpdateProgress`
Updates a player's test case count in real-time.
*   **Logic**:
    1.  Updates `testsPassed` and `totalTests`.
    2.  **Score Calculation**: Automatically calculates score as `math.floor((passed * 100) / total)`.
    3.  Ensures updates only happen if the match is in `PLAYING` status.

### 4. `AtomicKickPlayer`
Allows the host to remove a player during the lobby phase.
*   **Logic**: Removes the player from the `players` map AND deletes the `arena:user:room:[userId]` mapping key.

## 📡 Pub/Sub Synchronization

The Go Hub acts as a bridge for the **Bun API**.
*   **Channel**: `arena:room:updates`
*   **Flow**:
    1.  The Bun API (TypeScript) updates a room and publishes a message to the channel.
    2.  The Go Hub (ListenForUpdates) receives the message.
    3.  The Go Hub fetches the fresh data and broadcasts it to all connected WebSocket clients in that specific room.
