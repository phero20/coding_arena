# Contest Module Overview

The **Contest Module** operates as a data ingestion and caching pipeline. It automatically syncs external coding contests from platforms like LeetCode and Codeforces (via the `CLIST.by` API) and serves them to the frontend at high speed.

## Architecture

This module implements a classic "Read-Through / Sync-Ahead" architecture:

1. **Routes**: Defines the REST API endpoints (`/api/v1/contests/*`) using Hono.
2. **Controllers**: Standardizes the HTTP response objects.
3. **Services**: Contains the core logic. `ClistService` acts as an HTTP client to the external API, while `ContestService` maps the external schema to our internal schema, upserts it to Postgres, and primes the Redis cache.
4. **Repositories**: Interfaces with PostgreSQL via Drizzle ORM to maintain a persistent, searchable archive of all contests.

## Directory Structure

```text
api/src/
├── controllers/contest/
│   └── contest.controller.ts              # HTTP Request handlers
├── repositories/contest/
│   └── contest.repository.ts              # Postgres Operations (Drizzle)
├── routes/contest/
│   └── contest.routes.ts                  # Hono REST API definitions
└── services/contest/
    ├── clist.service.ts                   # External API integration
    └── contest.service.ts                 # Sync Engine and Caching strategy
```

## Documentation Layers

To explore the exact implementation details, please see the specific layer documentation:

- [Routes](./routes.md): REST Endpoints
- [Controllers](./controllers.md): HTTP handling
- [Services](./services.md): Sync Engine and Mapping logic
- [Cache](./cache.md): Complex Redis Sorted Sets Strategy
- [Repositories](./repositories.md): PostgreSQL Upsert logic
