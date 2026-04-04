# 🚀 Coding Arena: Technical Stack & Data Model

This document provides a deep-dive into the "Engine Room" of the **Coding Arena** platform, detailing the multi-database schema and the concurrency primitives.

---

## 🏗️ The Multi-Database Entity Map (ERD)

The system uses a **Polyglot Persistence Strategy**, selecting the right database for the right job: **PostgreSQL** for relational identity, **MongoDB** for complex documents, and **Redis** for ephemeral real-time state.

```mermaid
erDiagram
    subgraph PostgreSQL [User Identity]
        USERS {
            uuid id PK
            text clerk_id UK
            text username UK
            text email UK
            timestamp created_at
        }
    end

    subgraph MongoDB [Application Data]
        PROBLEMS {
            objectId _id PK
            string problem_id UK
            string title
            string slug
            array topics
            json code_snippets
        }
        SUBMISSIONS {
            objectId _id PK
            string submission_id UK
            string user_id FK
            string problem_id FK
            string code
            string status
            json results
        }
        ARENA_MATCHES {
            objectId _id PK
            string match_id UK
            string room_id FK
            string status
            array results
        }
    end

    subgraph Redis [Ephemeral State]
        MATCH_STATE {
            hash metadata ":" matchId
            set active_users ":" roomId
            list leaderboard ":" matchId
        }
        BULL_QUEUE {
            list submission_queue
            hash job_data
        }
    end

    USERS ||--o{ SUBMISSIONS : "submits"
    PROBLEMS ||--o{ SUBMISSIONS : "tested by"
    PROBLEMS ||--o{ ARENA_MATCHES : "solved in"
    ARENA_MATCHES ||--o{ SUBMISSIONS : "contains"
```

### Visual Database ERD
![Multi-Database ERD](./docs/diagrams/database_erd.png)

---

## ⚡ Concurrency & Logic Layer

### 🛠️ Hono / Bun (The Logic)
- **Dependency Injection**: 100% decoupled via **Awilix**, ensuring zero-leakage between business logic and infrastructure.
- **Validation**: **Zod** schemas are enforced at the Hono middleware layer, ensuring no invalid data reaches the service tier.
- **Performance**: Bun's `Buffer` and `Native Fetch` implementations ensure sub-10ms response times for metadata requests.

### ⚙️ Go (The Engine)
- **Hub/Client Pattern**: A centralized `Hub` manages rooms and broadcasts, while individual `Client` goroutines handle the duplex WebSocket traffic.
- **State Synchronization**: Does not poll the database; instead, it subscribes to **Redis Pub/Sub** channels (`arena:room:updates`) to trigger instantaneous broadcasts.
- **Deadlock Avoidance**: Uses `sync.RWMutex` for room memberships and buffered channels for message delivery.

### Go Arena - WebSocket Hub Architecture
![Realtime WebSocket](./docs/diagrams/realtime_websocket.png)

---

## 🛸 Background Processing & Job Lifecycle
We use **BullMQ** (powered by Redis) for all blocking tasks:
1. **Producer**: Hono API enqueues a `submission-eval` job.
2. **Priority**: Submissions are prioritized by match type (Arena vs Practice).
3. **Worker**: The evaluation worker pulls the job, calls the **Judge0/AI Judge**, and updates the persistence layer.
4. **Broadcast**: Upon completion, the worker publishes a completion trigger to Redis, which the **Go Hub** picks up to update the frontend.

---
*Status: Data Model Optimized (Multi-DB Architecture)* 🛡️🏗️✨🚀📊📈🔥🎨🍿🏆🏁🏙️🌆
