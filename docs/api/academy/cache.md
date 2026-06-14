# Academy Cache Layer

To ensure lightning-fast responses for highly-read, static curriculum data (like Track lists and Exercise details), the Academy module employs a **Cache Decorator** pattern over Redis.

**File**: [api/src/cache/academy/academy.cache.ts](../../../api/src/cache/academy/academy.cache.ts)

## Architecture: The Decorator Pattern

Instead of tightly coupling Redis calls inside the core `AcademyService`, we use a transparent cache wrapper:

1. `AcademyCache` implements the exact same `IAcademyService` interface as the real service.
2. The Awilix DI container injects `AcademyCache` into the `AcademyController`.
3. The `AcademyCache` receives the `rawAcademyService` as a dependency.
4. When the controller asks for data, the Cache intercepts the request. If the data is in Redis, it returns it instantly. If not, it calls `rawAcademyService` to fetch it from MongoDB, saves it to Redis, and then returns it.

## Cache Configuration

- **TTL (Time to Live)**: 86400 seconds (24 hours). Curriculum data rarely changes, making a long TTL ideal.
- **Fail-Open Strategy**: If Redis goes down or throws an error, the `AcademyCache` logs the error but seamlessly falls back to querying the `rawAcademyService`. This prevents a Redis outage from bringing down the Academy.

## Cache Keys

The layer utilizes a robust string-key taxonomy:
- **All Tracks**: `academy:tracks`
- **Track Config**: `academy:config:{slug}`
- **Concept Details**: `academy:concept:{trackSlug}:{conceptSlug}`
- **Exercise Details**: `academy:exercise:{trackSlug}:{exerciseSlug}`
- **Solved Exercises**: `academy:solved:{userId}:{trackSlug}`

## Invalidation

Cache invalidation for static curriculum (Tracks/Configs) is handled primarily through natural TTL expiration or manual Redis flushes during data deployments. Solved exercises are tracked differently and can trigger targeted invalidation upon successful code execution.
