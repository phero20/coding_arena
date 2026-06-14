# Solutions Module Overview

The **Solutions Module** manages community-submitted solutions and official editorial solutions for coding problems.

## Architecture

This module follows a standard REST architecture but heavily utilizes Redis caching to handle the high read-to-write ratio typical of community solution boards.

1. **Routes**: Defines the REST API endpoints (`/api/v1/solutions/*`) using Hono. Includes rate-limiting on upvotes.
2. **Controllers**: Extracts parameters and standardizes the HTTP response objects.
3. **Services**: Contains the core business logic, including upvote/downvote toggling.
4. **Repositories**: Interfaces with MongoDB using Mongoose for the `Solution` collection.
5. **Cache**: Implements a robust Redis caching layer using the Decorator pattern to ensure solution grids load instantly.

## Directory Structure

```text
api/src/
├── controllers/solutions/
│   └── solution.controller.ts             # HTTP Request handlers
├── routes/solutions/
│   └── solution.routes.ts                 # Hono REST API definitions
├── services/solutions/
│   └── solution.service.ts                # Business Logic
├── repositories/solutions/
│   └── solution.repository.ts             # MongoDB Data Persistence
└── cache/solutions/
    └── solution.cache.ts                  # Redis Caching Decorator
```

## Documentation Layers

To explore the exact implementation details, please see the specific layer documentation:

- [Routes](./routes.md): REST Endpoints
- [Controllers](./controllers.md): HTTP handling
- [Services](./services.md): Voting Logic and Operations
- [Repositories](./repositories.md): MongoDB Persistence Strategy
- [Cache](./cache.md): Redis Caching Decorator
