# Report Bug Module Overview

The **Report Bug Module** is a lightweight utility module designed to handle user feedback and bug reports from the frontend platform.

## Architecture

It follows a standard REST CRUD pattern but focuses heavily on write operations and administrative read operations.

1. **Routes**: Defines the REST API endpoints (`/api/v1/report-bug/*`) using Hono.
2. **Controllers**: Extracts validated payload from Hono and standardizes the API response.
3. **Services**: Contains the core business logic.
4. **Repositories**: Interfaces with MongoDB using Mongoose to store the reports.

Because bug reports are not queried heavily by users (only created by them and read by admins), this module does **not** implement a Redis Cache layer.

## Directory Structure

```text
api/src/
├── controllers/report-bug/
│   └── report-bug.controller.ts           # HTTP Request handlers
├── routes/report-bug/
│   └── report-bug.routes.ts               # Hono REST API definitions
├── services/report-bug/
│   └── report-bug.service.ts              # Business Logic
└── repositories/report-bug/
    └── report-bug.repository.ts           # MongoDB Data Persistence
```

## Documentation Layers

To explore the exact implementation details, please see the specific layer documentation:

- [Routes](./routes.md): REST Endpoints
- [Controllers](./controllers.md): HTTP handling
- [Services](./services.md): Business Logic
- [Repositories](./repositories.md): MongoDB Data Persistence
