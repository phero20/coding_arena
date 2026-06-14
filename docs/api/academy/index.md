# Academy Module Overview

The **Academy Module** is a core feature of the SlaveCode backend API. It is responsible for serving structured learning paths ("Tracks"), programming concepts, and coding exercises.

## Architecture

The Academy follows a strict, multi-layered architecture within the Awilix Dependency Injection container:

1. **Routes**: Defines the API endpoints (`/api/v1/academy/*`) using Hono.
2. **Controllers**: Extracts parameters from HTTP requests and delegates them to the service layer.
3. **Cache (Decorator)**: Intercepts service calls to fetch highly-read data (like track definitions) from Redis.
4. **Services**: Contains the core business logic, including fetching data and interacting with remote executors (Judge0) and AI Judges.
5. **Repositories**: Orchestrates data access between MongoDB (for static curriculum data) and PostgreSQL (for tracking user progress).

## Directory Structure

```text
api/src/
├── cache/academy/academy.cache.ts           # Redis caching layer
├── controllers/academy/                     # HTTP Request handlers
├── mongo/models/academymodels/              # Mongoose schemas for tracks/exercises
├── repositories/academy/academy.repository.ts # Database orchestration (Mongo + Postgres)
├── routes/academy/academy.routes.ts         # Hono API definitions
└── services/academy/                        # Business Logic (CRUD, Execution, AI)
```

## Documentation Layers

To explore the exact implementation details, please see the specific layer documentation:

- [Routes](./routes.md): API Endpoints and Payloads
- [Controllers](./controllers.md): HTTP handling
- [Services](./services.md): Business Logic
- [Cache](./cache.md): Redis implementation
- [Database Schema](./database-schema.md): Data Persistence
