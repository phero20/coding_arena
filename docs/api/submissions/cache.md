# Submissions Cache Layer

The `SubmissionCache` implements the Decorator Pattern to alleviate load on MongoDB from the user's "Submissions" tab.

**File Location**: [api/src/cache/submissions/submission.cache.ts](../../../api/src/cache/submissions/submission.cache.ts)

## Caching Strategy

- **`findUserSubmissions`**: Caches the paginated grid view of a user's past submissions.
  - **Key**: `submissions:list:{userId}:{problemId}:{limit}:{skip}`
  - **TTL**: 300 seconds (5 minutes).

## Cache Invalidation

When a user submits new code, their grid must update.
- **`create`**: Immediately executes a wildcard flush (`redis.del(submissions:list:{userId}:*)`) so that the new `PENDING` submission appears in their history instantly.
