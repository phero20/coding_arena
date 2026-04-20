# 🏗️ Coding Arena: Global System Architecture

This document defines the high-depth structural design of the **Coding Arena** platform. It follows the C4 model for visualizing software architecture, ensuring modularity, scalability, and robust inter-service communication.

## 🗺️ Component Topology (Infrastructure Layer)

The platform is a containerized, multi-lingual ecosystem. The following diagram illustrates the deployment topology and network boundaries.

```mermaid
graph TB
    subgraph "Public Internet"
        User([End User / Web Browser])
        ClerkAuth[Clerk Identity Provider]
    end

    subgraph "Docker Bridge Network"
        subgraph "Logic & Application"
            HonoAPI[Hono API <br/> (Bun Runtime) <br/> Port 3000]
            BullQueue[BullMQ Workers <br/> (Distributed Logic)]
        end
graph TD
    subgraph "Frontend Layer"
        Web[Next.js App]
    end

    subgraph "Logic Layer (TS)"
        API[Hono API]
        Workers[BullMQ Workers]
    end

    subgraph "Real-time Layer (Go)"
        Arena[Go Match Engine]
    end

    subgraph "Data & Messaging"
        Mongo[(MongoDB)]
        Redis[(Redis)]
        Postgres[(PostgreSQL)]
    end

    Web <-->|REST / Clerk Auth| API
    Web <-->|WebSockets| Arena
    API <-->|State / Metadata| Mongo
    API <-->|Jobs| Workers
    API <-->|Updates| Redis
    Arena <-->|Real-time State| Redis
    Redis <-->|PubSub| Arena
    Workers <-->|Evaluation| Redis
```

### Generated Infrastructure Map
![Global System Architecture](./docs/diagrams/system_architecture.png)

---

## 🏛️ Decision Log: High-Scale Concurrency

### Why Go for the Arena?
While **Bun/Hono** is extremely fast (handling thousands of requests per second), the **Go** engine was chosen for the WebSocket Hub due to its **preemptive scheduler** and **Goroutines**.
- **Isolation**: Each WebSocket connection has its own lightweight thread.
- **Deadlock Prevention**: Channels ensure thread-safe message passing without complex mutexes wherever possible.

### Why Hono/Bun for the API?
- **Speed**: Bun's native implementation of Web APIs makes Hono the fastest TS framework in the industry.
- **Developer Experience**: TypeScript's type-safety paired with **Awilix DI** ensures that business logic is separated from infrastructure.

---

## 🛡️ Service Responsibility Matrix

| Component | Responsibility | Technology Stack |
| :--- | :--- | :--- |
| **Logic Layer** | Auth, Room Creation, Social Data | Hono, Bun, Awilix |
| **Real-time Layer** | Match Sync, WebSocket Broadcast | Go, Gin, Channels |
| **Background Layer** | Code Evaluation, AI Judging | BullMQ, Node/Bun |
| **Persistence Layer** | Users, Problems, Match History | Postgres, MongoDB |
| **Ephemeral Layer** | Room State, Leaderboard, Pub/Sub | Redis |

---
*Status: Architecture Verified (Ultra-Deep)* 🛡️🏗️✨🚀📊📈🔥🎨🍿🏆🏁🏙️🌆
