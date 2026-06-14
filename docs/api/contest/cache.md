# Contest Cache Layer

The Contest Cache is the most critical performance component of the Contest module. Rather than being a simple Decorator around a service, it is a complex data structure manager that maintains a time-ordered sequence of events in Redis.

**File**: [api/src/cache/contest/contest.cache.ts](../../../api/src/cache/contest/contest.cache.ts)

## `ContestCache`

Because external coding contests happen on a strict chronological schedule, this cache uses a combination of Redis **Sorted Sets (ZSET)** and **expiring keys (TTL)** to perfectly manage the timeline.

### Caching Strategy

1. **The Timeline Index (Sorted Set)**
   - **Key**: `contests:timeline`
   - Every time new contests are synced from CLIST, the cache adds their IDs to this sorted set. The "Score" of each item in the set is the Unix Timestamp of the contest's `startTime`.
   - Before adding new items, the cache calls `zremrangebyscore(TIMELINE_KEY, "-inf", now)` to actively purge any contests from the index that have already ended.

2. **The Contest Payloads (Key-Value)**
   - **Key**: `contest:ext:{clistId}`
   - The actual JSON stringified contest data is stored in individual keys.
   - **Smart TTL**: The Time-To-Live for each payload is dynamically calculated as `endTime - now`. This means the exact second a contest finishes, Redis automatically drops the payload from memory without any manual cleanup required!

### Retrieval (`getUpcomingContests`)

When the frontend requests the upcoming schedule:
1. The cache uses `zrangebyscore` to fetch all contest IDs from the `contests:timeline` that occur *after* the current Unix timestamp, honoring the requested `limit`.
2. It then uses `mget` (Multi-Get) to bulk-fetch all the JSON payloads for those specific IDs in a single, lightning-fast Redis roundtrip.
