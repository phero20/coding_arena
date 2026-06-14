# System Design Cache Layer

The `SystemDesignCache` uses the Decorator Pattern to wrap the `SystemDesignService` with Redis caching.

**File Location**: [api/src/cache/system-design/system-design.cache.ts](../../../api/src/cache/system-design/system-design.cache.ts)

## Caching Strategy

Because system design problems are relatively static, they are heavily cached.

- **`getAll`**: Caches the paginated grid.
  - **Key**: `system-design:list:{limit}:{skip}:{filters}`
  - **TTL**: 300 seconds (5 minutes).
- **`getBySlug`**: Caches the individual problem details.
  - **Key**: `system-design:slug:{slug}`
  - **TTL**: 86400 seconds (24 hours).

## Cache Invalidation

When an admin modifies the catalog:
- **`create` / `delete`**: The cache decorator automatically executes a wildcard flush (`redis.del('system-design:list:*')`) to ensure the frontend grid accurately reflects the newly added or deleted problems immediately.
