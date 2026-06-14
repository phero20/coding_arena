# Arena Workers

The Arena workers ensure that the stateful multiplayer environment (which lives largely in Redis) remains clean and does not leak memory.

**File Location**: [api/src/workers/arena/](../../../api/src/workers/arena/)

## 1. `match-enforcer.worker.ts`

Multiplayer Arena matches have a strict time limit (e.g., 10 minutes).
- **Architecture**: A simple `setInterval` heartbeat scanner that runs every 10 seconds.
- **Logic**: It queries Redis for all active playing rooms. If it finds a room where `now >= endTime`, it forces the match to finish (`arenaMatchService.forceFinishMatch()`).
- **Resilience**: It hooks into `registerShutdownHandler` to cleanly clear its interval before the Node process exits.

## 2. `arena-cleanup.worker.ts`

When a match ends, the users are shown a post-game summary screen.
- **Architecture**: A standard BullMQ Worker listening to the `arena-cleanup` queue.
- **Logic**: When an Arena match concludes, a delayed job is pushed to this queue (usually set to delay for 15-30 minutes). When the job fires, it purges all traces of that `roomId` from Redis memory (`arenaRepository.deleteRoom(roomId)`).
- **Concurrency**: Set to `5` to ensure multiple rooms can be cleaned simultaneously without choking Redis.
