# Stats Cache Layer

The Stats module implements a Redis Cache layer strictly for the Global Leaderboard.

**File Location**: [api/src/cache/stats/leaderboard.cache.ts](../../../api/src/cache/stats/leaderboard.cache.ts)

## `LeaderboardCache`

Instead of running an expensive `ORDER BY` query across the entire PostgreSQL `users` table on every request, the leaderboard is maintained entirely in a Redis **Sorted Set** (`ZSET`).

### Operations:
1. **`updateScore(userId, increment)`**: 
   - Executed silently in the background by the Judge worker whenever a user solves a problem.
   - Executes `ZINCRBY global_leaderboard {increment} {userId}`.
2. **`getTopUsers(limit)`**:
   - Executed when a user visits the `/leaderboard` page.
   - Executes `ZREVRANGE global_leaderboard 0 {limit - 1} WITHSCORES` to fetch the top players in `O(log(N) + M)` time.
   - This makes the leaderboard infinitely scalable and completely real-time.
