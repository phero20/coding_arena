# Problems Cache Layer

The Problems Cache uses the Decorator Pattern to intercept and cache the heavy MongoDB queries executed by the repositories.

**File Location**: [api/src/cache/problems/](../../../api/src/cache/problems/)

## 1. `ProblemCache` (`problem.cache.ts`)

Because coding problems rarely change, they are aggressively cached.

### Strategies:
- **`findMany`**: Caches the paginated grid view.
  - **Key**: `problems:list:{limit}:{offset}:{filters}`
  - **TTL**: 300 seconds (5 minutes). This is short enough that new problems appear quickly, but long enough to absorb traffic spikes.
- **`findBySlug`**: Caches the individual problem details.
  - **Key**: `problem:slug:{slug}`
  - **TTL**: 86400 seconds (24 hours). The details of a problem almost never change.
- **Invalidation**: When `create` or `update` is called, the cache immediately calls `redis.del()` on the specific slug key and wildcard flushes the `problems:list:*` keys so the grid instantly updates.

## 2. `ProblemTestCache` (`problem-test.cache.ts`)

Test cases are fetched constantly by the backend Judge worker during evaluation.

### Strategy:
- **`findAllByProblem`**: Caches both public and hidden test cases together.
  - **Key**: `problem-tests:{problemId}`
  - **TTL**: 86400 seconds (24 hours).
- **Worker Optimization**: By caching this, the Judge worker (`SubmissionEvaluator`) can fetch all 100 hidden test cases from Redis memory in milliseconds rather than hitting MongoDB on every code submission!
