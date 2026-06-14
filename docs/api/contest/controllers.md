# Contest Controller

The `ContestController` handles routing HTTP requests to the `ContestService`.

**File**: [api/src/controllers/contest/contest.controller.ts](../../../api/src/controllers/contest/contest.controller.ts)

## `ContestController`

Extends the standard `BaseController` and manages parameter parsing for pagination (limit/offset). Currently, all endpoints are marked as `{ requireAuth: false }` to allow public users and frontend guests to view the upcoming contest schedule.

### Actions:

1. **`getExternalContests`**
   - Parses `limit` (default: 20) and `offset` (default: 0) from the query parameters.
   - Delegates to `contestService.getExternalContests()` for a direct proxy hit to CLIST.

2. **`getUpcomingContests`**
   - Parses `limit` (default: 200).
   - Delegates to `contestService.getUpcomingContests()` to fetch the cached/persistent upcoming contests.

3. **`syncContests`**
   - A parameterless trigger.
   - Delegates to `contestService.syncExternalContests()`. Returns a success message to confirm the background ingestion has completed.
