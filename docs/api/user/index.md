# User Module Overview

The **User Module** governs core identity and social features on the platform. It handles basic user management (syncing with Clerk), profile retrieval, and the platform's follower/following social graph.

## Architecture

This module is segmented logically into multiple sub-domains:
1. **User Identity**: Synchronizing user data (username, profile pictures) with Clerk via Webhooks.
2. **Follow Graph**: Managing who follows whom and calculating follower/following counts.
3. **Public Profiles**: Fetching aggregated data for a user's public profile page.

## Directory Structure

```text
api/src/
├── controllers/user/
│   ├── user.controller.ts                 # Clerk Webhook handlers
│   ├── profile.controller.ts              # Public profile handlers
│   └── follow.controller.ts               # Social graph handlers
├── routes/user/
│   ├── user.routes.ts                     # User identity REST Endpoints
│   ├── profile.routes.ts                  # Profile REST Endpoints
│   └── follow.routes.ts                   # Social graph REST Endpoints
├── services/user/
│   ├── user.service.ts                    # Core user logic
│   └── follow.service.ts                  # Social graph logic
├── repositories/user/
│   ├── user.repository.ts                 # PostgreSQL Drizzle ORM
│   └── follow.repository.ts               # PostgreSQL Drizzle ORM
└── cache/user/
    ├── user-stats.cache.ts                # Cache Decorator for profile stats
    └── leetcode.cache.ts                  # Cache Decorator for Leetcode sync statuses
```

## Documentation Layers

To explore the exact implementation details, please see the specific layer documentation:

- [Routes](./routes.md): REST Endpoints
- [Controllers](./controllers.md): HTTP handling
- [Services](./services.md): User Identity and Social Graph Logic
- [Repositories](./repositories.md): PostgreSQL Persistence Strategy
- [Cache](./cache.md): User Stats Caching
