# Solutions Cache Layer

The `SolutionCache` implements the Decorator Pattern over the `SolutionService` to handle the high volume of read queries typical of community discussion boards.

**File Location**: [api/src/cache/solutions/solution.cache.ts](../../../api/src/cache/solutions/solution.cache.ts)

## Caching Strategy

Because popular problems might have thousands of users viewing the "Solutions" tab simultaneously, querying MongoDB every time would be a bottleneck.

- **`getSolutions`**: Caches the paginated list of solutions for a given problem and language.
  - **Key**: `solutions:{problemId}:{languageId}:{sortBy}:{limit}:{skip}`
  - **TTL**: 300 seconds (5 minutes). This ensures the board feels "live" and new solutions appear quickly, while absorbing 99% of the database read traffic.

## Cache Invalidation

When a user interacts with a solution, the cache must be updated immediately to prevent stale data.

- **`createSolution`**: Immediately wildcard flushes all `solutions:{problemId}:*` keys so the user's new post appears instantly.
- **`voteSolution`**: Immediately wildcard flushes the `solutions:{problemId}:*` keys so the user's upvote is reflected on the UI instantly.
