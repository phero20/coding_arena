# Background Workers Overview

While the main API handles synchronous HTTP requests and fast cache reads, the **Workers Module** manages all heavy, asynchronous, and scheduled background tasks. This ensures the primary Node.js event loop remains unblocked and responsive to end-users.

## Architecture

The workers are powered heavily by **BullMQ** (using Redis as the message broker). The worker infrastructure is segmented into three distinct domains:

1. **Submission Worker**: The heaviest pipeline. It pulls un-evaluated code from a queue, safely executes it against hidden test cases, updates PostgreSQL stats, and handles multiplayer Arena match scoring.
2. **Arena Workers**: Handles multiplayer game-state lifecycle events, such as match timeouts and garbage collection of dead Redis rooms.
3. **Contest Worker**: A cron-style scheduled worker that periodically scrapes third-party APIs (like Codeforces and LeetCode) to keep the global contest calendar updated.

## Directory Structure

```text
api/src/workers/
├── submission/
│   ├── submission.worker.ts               # Bootstraps the BullMQ worker
│   ├── processor.ts                       # Controls the exact flow of a submission
│   ├── evaluator.ts                       # Determines Execution Engine vs AI Judge
│   ├── events.ts                          # Socket.io realtime broadcast bindings
│   └── config.ts                          # Queue configurations
├── arena/
│   ├── arena-cleanup.worker.ts            # Delayed GC for multiplayer rooms
│   └── match-enforcer.worker.ts           # Heartbeat scanner for match timeouts
└── contest/
    └── contest.worker.ts                  # Cron job for syncing external contests
```

## Documentation Layers

To explore the exact implementation details, please see the specific worker documentation:

- [Submission Worker](./submission.md): Detailed breakdown of the async code execution pipeline.
- [Arena Workers](./arena.md): How multiplayer states are safely terminated.
- [Contest Worker](./contest.md): Cron scheduling and external API synchronization.
