# Taxonomy Module Overview

The **Taxonomy Module** manages the tagging and classification system across the platform. It maintains the master list of `Tags` (e.g., "Dynamic Programming", "Graphs", "Binary Search") which are used to filter and categorize Problems and System Design questions.

## Architecture

This module is essentially a highly-cached metadata provider. Because tags rarely change but are fetched constantly by the frontend to populate filter dropdowns, the cache layer plays a massive role here.

## Directory Structure

```text
api/src/
├── controllers/taxonomy/
│   └── taxonomy.controller.ts             # HTTP Request handlers
├── routes/taxonomy/
│   └── taxonomy.routes.ts                 # Hono REST API definitions
├── services/taxonomy/
│   └── taxonomy.service.ts                # Core Business Logic
├── repositories/taxonomy/
│   └── taxonomy.repository.ts             # MongoDB Data Persistence
└── cache/taxonomy/
    └── taxonomy.cache.ts                  # Redis Caching Decorator
```

## Documentation Layers

To explore the exact implementation details, please see the specific layer documentation:

- [Routes](./routes.md): REST Endpoints
- [Controllers](./controllers.md): HTTP handling
- [Services](./services.md): Tag Management Logic
- [Repositories](./repositories.md): MongoDB Persistence Strategy
- [Cache](./cache.md): Redis Caching Decorator
