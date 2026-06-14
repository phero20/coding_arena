# Stats Services

The core logic of the Stats module is broken down into three specialized services.

**File Location**: [api/src/services/stats/](../../../api/src/services/stats/)

## 1. `stats.service.ts`
Handles all read-heavy profile queries.
- **`getUserStats`**: Fetches the user's `Stats` row from PostgreSQL. Automatically creates a default row if the user is new.
- **`getLeaderboard`**: Fetches the global ranking from the Redis Sorted Set.
- **`getUserHeatmap`**: Aggregates the last 365 days of submissions from PostgreSQL to build a frontend calendar array.

## 2. `stats-submission.service.ts`
The async bridge between the **Judge Worker** and the **Stats database**.
- **`processSubmission`**: When a user's code finishes executing, the BullMQ worker calls this method.
- **Logic**: 
  - If the verdict is `ACCEPTED`, it atomically increments the user's `easy/medium/hardSolved` count in Postgres.
  - It also increments the global Redis `leaderboard` ZSET score!
  - It records the daily activity to update the user's heatmap.

## 3. `leetcode.service.ts`
A specialized integration service.
- **`syncUserStats`**: Connects to the unofficial LeetCode GraphQL API. It fetches a user's matched profile, extracts their `easySolved`, `mediumSolved`, and `hardSolved` counts, and synchronizes them directly into the platform's PostgreSQL database to bootstrap their profile!
