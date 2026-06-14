# Stats Module Overview

The **Stats Module** tracks user performance across the platform. It handles the processing of submission results, generating heatmaps, maintaining user statistics (e.g., accepted problems, global ranking), and managing integration with third-party platforms like LeetCode.

## Architecture

This module is a heavily asynchronous, write-intensive domain.

1. **Routes**: Defines the REST API endpoints (`/api/v1/stats/*`) using Hono.
2. **Controllers**: Extracts HTTP parameters and formats API responses.
3. **Services**: Contains the core logic. Features standard `stats.service.ts` for profile reads, `leetcode.service.ts` for third-party scraping, and `stats-submission.service.ts` for asynchronous updates from the Judge worker.
4. **Repositories**: Interfaces with PostgreSQL using Drizzle ORM to maintain strict ACID compliance for user statistics and rankings.
5. **Cache**: Uses Redis `leaderboard.cache.ts` using Sorted Sets (`ZSET`) to instantly rank users globally.

## Directory Structure

```text
api/src/
├── controllers/stats/
│   └── stats.controller.ts                # HTTP Request handlers
├── routes/stats/
│   └── stats.routes.ts                    # Hono REST API definitions
├── services/stats/
│   ├── stats.service.ts                   # Core profile and heatmap logic
│   ├── leetcode.service.ts                # Third-party profile synchronization
│   └── stats-submission.service.ts        # Worker callback handlers for submissions
├── repositories/stats/
│   └── stats.repository.ts                # Drizzle ORM Data Persistence
└── cache/stats/
    └── leaderboard.cache.ts               # Redis Sorted Set Leaderboard
```

## Documentation Layers

To explore the exact implementation details, please see the specific layer documentation:

- [Routes](./routes.md): REST Endpoints
- [Controllers](./controllers.md): HTTP handling
- [Services](./services.md): Leaderboard, LeetCode sync, and Worker hooks
- [Repositories](./repositories.md): PostgreSQL Schema & Operations
- [Cache](./cache.md): Redis Sorted Sets logic
