# Workspace Module Overview

The **Workspace Module** powers the core IDE experience. When a user opens a problem, this module fetches the user's saved code, settings, and layout preferences, persisting their state so they can seamlessly continue coding across devices.

## Architecture

This module requires extremely fast read/write speeds, as the editor constantly autosaves the user's code. To prevent overwhelming the primary database, the `WorkspaceCache` acts as a heavily optimized write-through buffer.

## Directory Structure

```text
api/src/
├── controllers/workspace/
│   └── workspace.controller.ts             # HTTP Request handlers
├── routes/workspace/
│   └── workspace.routes.ts                 # Hono REST API definitions
├── services/workspace/
│   └── workspace.service.ts                # Core Business Logic
├── repositories/workspace/
│   └── workspace.repository.ts             # MongoDB Data Persistence
└── cache/workspace/
    └── workspace.cache.ts                  # Complex Write-Through Redis Cache
```

## Documentation Layers

To explore the exact implementation details, please see the specific layer documentation:

- [Routes](./routes.md): REST Endpoints
- [Controllers](./controllers.md): HTTP handling
- [Services](./services.md): Session logic
- [Repositories](./repositories.md): MongoDB Persistence Strategy
- [Cache](./cache.md): Write-through caching magic
