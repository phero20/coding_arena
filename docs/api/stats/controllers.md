# Stats Controllers

The `StatsController` handles data extraction from the incoming request.

**File Location**: [api/src/controllers/stats/stats.controller.ts](../../../api/src/controllers/stats/stats.controller.ts)

## Actions

1. **`syncLeetCode`**: 
   - Takes the authenticated user's `clerkId`.
   - Passes it to `leetcodeService.syncUserStats()`.

2. **`getLeaderboard`**: 
   - Extracts `limit` and `skip` query params.
   - Defaults to top 50 if not specified.
   - Uses `statsService.getLeaderboard()`.

3. **`getUserStats`**, **`getUserHeatmap`**, **`getUserProgress`**:
   - All extract the `username` path parameter.
   - Route to their respective methods in `StatsService`.
