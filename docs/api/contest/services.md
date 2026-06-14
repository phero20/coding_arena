# Contest Services

The Contest services act as a data integration pipeline, mapping an external payload to our internal schemas, and then layering Redis on top of PostgreSQL for optimal read performance.

## 1. `ClistService`

**File**: [api/src/services/contest/clist.service.ts](../../../api/src/services/contest/clist.service.ts)

A dedicated HTTP client for the [CLIST.by API](https://clist.by/api/v1/).

- Uses `fetch` to retrieve the global list of upcoming coding contests.
- Secures authentication using `config.clistUsername` and `config.clistApiKey` injected from environment variables.
- Configures complex query parameters like `order_by=start` and `start__gte={now}` to ensure it only retrieves contests happening in the future.

---

## 2. `ContestService`

**File**: [api/src/services/contest/contest.service.ts](../../../api/src/services/contest/contest.service.ts)

The central orchestration engine. It balances data integrity (PostgreSQL) with frontend performance (Redis).

### `syncExternalContests`
The data ingestion engine. It performs the following steps:
1. Calls `clistService.getContests` requesting contests happening within the **next 15 days**.
2. Iterates through the raw payload and normalizes dirty data (e.g., standardizing the `platform` string and extracting the `icon` URL).
3. Maps the data to the internal `NewContest` schema.
4. Uses `contestRepository.upsert(mapped)` to push the data into PostgreSQL.
5. Immediately primes the `ContestCache` in Redis with the newly saved upcoming contests.

### `getUpcomingContests`
The highly optimized read path used by the frontend.
1. **Cache Hit**: Tries to fetch contests from Redis via `contestCache.getUpcomingContests()`. If found, it filters them to ensure they are still within the 15-day window and returns them instantly.
2. **Cache Miss**: If Redis is empty or purged, it queries the `contestRepository` in PostgreSQL.
3. **Re-prime**: If it had to use Postgres, it immediately writes the result back into Redis so subsequent hits are fast.
