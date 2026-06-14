# Arena Module Overview

The **Arena Module** in the Node.js API acts as the orchestrator and state-manager for multiplayer coding battles. While the Go Hub handles the real-time WebSocket communication during a match, the Node.js API is responsible for creating the rooms, assigning problems, validating rules, starting matches, and storing the final results.

## Architecture

The Arena relies on a robust relational architecture using Drizzle ORM and Awilix DI:

1. **Routes**: Defines the REST API endpoints (`/api/v1/arena/*`) using Hono.
2. **Controllers**: Extracts parameters and standardizes the request flow.
3. **Services**: Contains extensive business logic, split across multiple specialized files to handle match state, validation, broadcasting, and general room operations.
4. **Repositories**: Manages the fast real-time state using **Redis** (Lobbies/Rooms) and persistent storage using **MongoDB** (Matches & Submissions).

## Directory Structure

```text
api/src/
├── controllers/arena/
│   └── arena.controller.ts                # HTTP Request handlers
├── repositories/arena/
│   ├── arena.repository.ts                # Room/Participant state
│   ├── arena-match.repository.ts          # Match lifecycle state
│   └── arena-submission.repository.ts     # Code submissions
├── routes/arena/
│   └── arena.routes.ts                    # Hono REST API definitions
└── services/arena/
    ├── arena.service.ts                   # Room creation & management
    ├── arena-match.service.ts             # Match start/end logic
    ├── match-broadcaster.service.ts       # Triggering events
    ├── match-domain-engine.service.ts     # Game rules calculations
    └── match-validator.service.ts         # Pre-match validation
```

## Documentation Layers

Explore the exact implementation details in the specific layer documentation:

- [Routes](./routes.md): REST Endpoints, Payloads, and Middlewares
- [Controllers](./controllers.md): HTTP handling and DI Resolution
- [Services](./services.md): Business Logic and Match State Engines
- [Cache](./cache.md): Redis Decorator for Historical Match Data
- [Repositories](./repositories.md): MongoDB Data Persistence and Redis State
