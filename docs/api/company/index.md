# Company Module Overview

The **Company Module** is responsible for managing company profiles (like Google, Meta, Amazon) and grouping related coding problems together. This powers the "Top Interview Questions by Company" feature on the frontend.

## Architecture

This module follows a standard layered architecture, but features a unique dependency injection pattern to achieve high performance when hydrating problem sets:

1. **Routes**: Defines the REST API endpoints (`/api/v1/companies/*`) using Hono.
2. **Controllers**: Extracts parameters from HTTP requests and routes them.
3. **Services**: Contains the business logic. Notably, the `CompanyService` pulls in both the `CompanyRepository` and the `ProblemRepository` to instantly hydrate the raw `problem_ids` stored in the company documents into full Problem objects.
4. **Repositories**: Interfaces with MongoDB to store the Company documents. Features optimized projections to keep grid-view queries lightweight.

## Directory Structure

```text
api/src/
├── controllers/company/
│   └── company.controller.ts              # HTTP Request handlers
├── repositories/company/
│   └── company.repository.ts              # MongoDB Operations
├── routes/company/
│   └── company.routes.ts                  # Hono REST API definitions
└── services/company/
    └── company.service.ts                 # Business Logic and Hydration
```

## Documentation Layers

To explore the exact implementation details, please see the specific layer documentation:

- [Routes](./routes.md): REST Endpoints
- [Controllers](./controllers.md): HTTP handling
- [Cache](./cache.md): Redis Decorator for Hydrated Data
- [Services](./services.md): Business Logic and Cross-Repository Hydration
- [Repositories](./repositories.md): MongoDB Data Persistence and Optimizations
