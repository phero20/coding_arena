# Arena Cache Layer

The Arena Cache implements a high-performance Cache-Aside strategy for Arena Match data.

**File**: [api/src/cache/arena/arena-match.cache.ts](../../../api/src/cache/arena/arena-match.cache.ts)

## `ArenaMatchCache`

Unlike the `ArenaRepository` which uses Redis for ephemeral, mutating Room state, the `ArenaMatchCache` uses Redis to cache **historical match data** from MongoDB. It uses the decorator pattern to wrap `rawArenaMatchService`.

### Caching Strategies

1. **`HISTORY` (Match List)**
   - **TTL**: 300 seconds (5 minutes)
   - **Key**: `arena:match:history:{userId}:{limit}:{offset}`
   - **Reasoning**: A user's match history changes frequently when they play new matches, so the TTL is kept relatively short to ensure data freshness without sacrificing pagination performance.

2. **`DETAIL` (Match Summary)**
   - **TTL**: 86400 seconds (24 hours)
   - **Key**: `arena:match:detail:{matchId}`
   - **Reasoning**: **CRITICAL OPTIMIZATION**. It explicitly checks `if (detail.status === "COMPLETED")` before caching. Because a completed match is immutable (its rankings and scores will never change), we can safely cache it for a full 24 hours.

### Pass-Through Methods
Methods like `handleMatchSubmission` and `finalizeMatch` are life-cycle mutation methods, so they are not cached. The decorator simply passes these requests straight through to the `rawArenaMatchService`.
