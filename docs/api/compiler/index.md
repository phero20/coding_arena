# Compiler Module Overview

The **Compiler Module** acts as a stateless, public proxy for code execution. Instead of requiring a heavy local Docker daemon or complex sandbox environment to compile code, it delegates the actual compilation to the public [Wandbox API](https://wandbox.org/).

## Architecture

This module is intentionally lightweight and lacks a repository layer, as it does not persist user code to the database:

1. **Routes**: Defines the REST API endpoints (`/api/v1/compiler/*`) using Hono. It implements strict rate limiting here to prevent API abuse.
2. **Controllers**: Extracts parameters and standardizes the HTTP response objects.
3. **Services**: Contains the core logic. It uses an inline Redis caching mechanism for fetching supported languages, and formats the unpredictable Wandbox responses into a clean, predictable internal interface.

## Directory Structure

```text
api/src/
├── controllers/compiler/
│   └── compiler.controller.ts             # HTTP Request handlers
├── routes/
│   └── compiler.routes.ts                 # Hono REST API definitions
└── services/compiler/
    └── compiler.service.ts                # Inline Caching and Wandbox formatting
```

## Documentation Layers

To explore the exact implementation details, please see the specific layer documentation:

- [Routes](./routes.md): REST Endpoints and Rate Limiting
- [Controllers](./controllers.md): HTTP handling
- [Services](./services.md): Execution Standardization and Inline Cache
