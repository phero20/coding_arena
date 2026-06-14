# Stats Repositories

The `StatsRepository` uses **Drizzle ORM** and **PostgreSQL** to ensure absolute consistency for user statistics.

**File Location**: [api/src/repositories/stats/stats.repository.ts](../../../api/src/repositories/stats/stats.repository.ts)

## Responsibilities

1. **`upsertStats`**: Uses PostgreSQL `ON CONFLICT` constraints to atomically increment solved counts without race conditions.
2. **`logSubmissionActivity`**: Inserts records into the `UserActivity` table, which is later grouped by `DATE()` to generate the heatmap.
3. **`getUserStats`**: Standard select queries to populate the user profile.

Because statistics require atomic transactions (e.g., adding `+1` to `easy_solved` exactly once when a problem is passed), PostgreSQL is preferred here over MongoDB.
