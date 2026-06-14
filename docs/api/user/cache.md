# User Cache Layer

The cache decorators in the User module wrap heavy profile and third-party queries.

**File Location**: [api/src/cache/user/](../../../api/src/cache/user/)

## 1. `user-stats.cache.ts`
- Caches the heavy `getUserStats` and `getHeatmap` logic for public profiles.
- **TTL**: Usually 5-10 minutes.
- **Invalidation**: Flushed asynchronously whenever the Judge worker records a new successful submission for that user.

## 2. `leetcode.cache.ts`
- Caches the third-party LeetCode integration statuses.
- Prevents the system from being rate-limited by the unofficial LeetCode GraphQL API when a user repeatedly refreshes their profile.
