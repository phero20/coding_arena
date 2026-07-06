# AI Chat Module Overview

The **Chat Module** provides the backend infrastructure for the interactive AI assistant within SlaveCode. It allows users to have contextual conversations with the One API-powered AI while actively building System Design diagrams. 

## Architecture

The Chat feature is deeply integrated with the workspace system to ensure conversations have the correct context:

1. **Routes**: Defines the REST API endpoints (`/api/v1/chat/*`) using Hono.
2. **Controllers**: Standardizes the HTTP request/response flow.
3. **Services**: Contains the core logic. It verifies diagram ownership, dynamically creates conversational threads, maintains a fast Redis sliding-window for conversational memory, and hands off the prompt + semantic canvas state to the LLM via One API.
4. **Repositories**: Stores the long-term history of threads and messages in PostgreSQL using Drizzle ORM.

## Directory Structure

```text
api/src/
├── controllers/chat/
│   └── chat.controller.ts                # HTTP Request handlers
├── repositories/chat/
│   └── chat.repository.ts                # Database orchestration (Postgres)
├── routes/chat/
│   └── chat.routes.ts                    # Hono REST API definitions
└── services/chat/
    └── chat.service.ts                   # Thread management, Redis memory, and AI delegation
```

## Documentation Layers

To explore the exact implementation details, please see the specific layer documentation:

- [Routes](./routes.md): REST Endpoints and Payloads
- [Controllers](./controllers.md): HTTP handling and DI Resolution
- [Cache](./cache.md): Redis Sliding Window Memory
- [Services](./services.md): AI integration, security, and One API engine handoff
- [Repositories](./repositories.md): PostgreSQL Data Persistence
