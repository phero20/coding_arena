# Submissions Module Overview

The **Submissions Module** is the primary interface for users executing and submitting code. It acts as the gateway to the background Judge system.

## Architecture

This module handles two highly distinct workflows:
1. **Execution**: "Run Code" — a fast, synchronous evaluation against a few public sample test cases. Returns immediately to the user.
2. **Submission**: "Submit Code" — a heavy, asynchronous evaluation against all hidden test cases. Pushes a job to the BullMQ queue and requires the user to poll for the result.

## Directory Structure

```text
api/src/
├── controllers/submissions/
│   └── submission.controller.ts             # HTTP Request handlers
├── routes/submissions/
│   └── submission.routes.ts                 # Hono REST API definitions
├── services/submissions/
│   ├── execution.service.ts                 # Synchronous "Run Code" logic
│   └── submission.service.ts                # Asynchronous BullMQ "Submit Code" logic
├── repositories/submissions/
│   └── submission.repository.ts             # MongoDB Data Persistence
└── cache/submissions/
    └── submission.cache.ts                  # Redis Caching Decorator
```

## Documentation Layers

To explore the exact implementation details, please see the specific layer documentation:

- [Routes](./routes.md): REST Endpoints
- [Controllers](./controllers.md): HTTP handling
- [Services](./services.md): Execution vs Submission pipelines
- [Repositories](./repositories.md): MongoDB Persistence Strategy
- [Cache](./cache.md): Redis Caching Decorator
