# Backend Infrastructure: Background Workers

SlaveCode uses a set of high-resilience background workers to manage real-time matches, perform system cleanups, and synchronize external content.

## ⚔️ Arena Workers

### 1. `MatchEnforcer` (`arena/match-enforcer.worker.ts`)
The "Heartbeat" of the competitive engine.
*   **Schedule**: Runs every 10 seconds.
*   **Responsibility**: Scans all Redis rooms currently in `PLAYING` status. If the current time exceeds the `endTime`, it triggers a `forceFinishMatch()` event.
*   **Graceful Shutdown**: Implements a dedicated shutdown handler to clear the `setInterval` timer and prevent resource leaks.

### 2. `ArenaCleanup` (`arena/arena-cleanup.worker.ts`)
Ensures Redis does not get cluttered with abandoned rooms.
*   **Responsibility**: Deletes room data from Redis after a match is finalized and persisted to MongoDB.

---

## 🏆 Content Workers

### 1. `ContestWorker` (`contest/contest.worker.ts`)
Keeps the "Upcoming Contests" board fresh.
*   **Responsibility**: 
    1.  Queries external APIs (e.g., CLIST) for future coding contests.
    2.  Updates the `contests` table in PostgreSQL.
    3.  Invalidates the Redis cache for the `/api/v1/contests` endpoint.

---

## 📝 Execution Workers

### 1. `SubmissionWorker` (`submission/submission.worker.ts`)
Handles the asynchronous callback logic for code execution.
*   **Responsibility**: When Judge0 finishes a long-running execution, this worker processes the result, calculates points, and updates the user's statistics in the database.
