# Contest Worker

The Contest Worker handles the periodic synchronization of external coding contests (from platforms like Codeforces, LeetCode, CodeChef, etc.) into the local platform database.

**File Location**: [api/src/workers/contest/contest.worker.ts](../../../api/src/workers/contest/contest.worker.ts)

## Architecture

Unlike the other workers which react to user events (like submitting code), the Contest Worker operates on a **cron-schedule**.

- **Queue Engine**: BullMQ `contestSyncQueue`.
- **Concurrency**: Hardcoded to `1`. This is absolutely critical to prevent concurrent workers from scraping third-party APIs simultaneously and triggering IP bans or rate limits.

## Scheduling Strategy

1. **Repeatable Job**: On startup, `initContestSyncSchedule()` creates a BullMQ repeatable job using the cron pattern `0 */6 * * *` (Every 6 hours).
2. **Deduplication**: It clears any existing repeatable jobs by key before adding the new one to prevent orphaned cron jobs from stacking up across deployments.
3. **Cold Start**: It immediately fires a one-time `"initial-sync"` job so that fresh deployments populate the database instantly without having to wait 6 hours.

When the job fires, it delegates to `contestService.syncExternalContests()`.
