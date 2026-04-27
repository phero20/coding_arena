# 🌊 Coding Arena: Data & System Flows

This document maps the critical "Dynamic Paths" in the **Coding Arena** system, from match joining to AI-powered code evaluation.

---

## ⚡ Match Lifecycle & Synchronization

How the **Next.js Frontend**, **Hono API**, and **Go Arena** work together to synchronize a live match.

```mermaid
sequenceDiagram
    participant User as Web (Client)
    participant API as Hono API (TS)
    participant Redis as Redis Pub/Sub
    participant Arena as Go Arena (Hub)

    User->>API: POST /arena/room/ready
    API->>API: Check conditions (All players ready?)
    API->>Redis: PUBLISH arena:room:updates {type: "MATCH_STARTED"}
    Redis-->>Arena: Update Received
    Arena->>User: WS: "MATCH_STARTED" (Broadcast to room)
    User->>User: Redirect to /arena/match/:matchId
```

---

## 🧪 Submission & Evaluation Pipeline

The high-depth journey of a coding submission through the async workers and the AI evaluator.

```mermaid
sequenceDiagram
    participant User as Web (Client)
    participant API as Hono API
    participant Queue as BullMQ (Redis)
    participant Worker as Evaluation Worker
    participant Judge as Judge0 / AI Judge
    participant Arena as Go Arena (WebSocket)

    User->>API: POST /submissions/submit
    API->>Queue: Push Job {submissionId, lang, code}
    API-->>User: 202 Accepted (submissionId)
    
    Queue->>Worker: Pull Job
    Worker->>Judge: POST /run (Execute Tests)
    Judge-->>Worker: Run Results (Pass/Fail)
    
    Worker->>Worker: Calculate Score & Leaderboard
    Worker->>API: Update Submission & Match State
    Worker->>Arena: PUBLISH Redis arena:room:updates {type: "LEADERBOARD_UPDATED"}
    
    Arena->>User: WS: "LEADERBOARD_UPDATED" (Live UI Sync)
```

---

## 🔑 Authentication & Social Sync

How we maintain a consistent user profile across the system.

```mermaid
graph LR
    subgraph "External"
        Clerk[Clerk Auth]
    end

    subgraph "Internal"
        API[Hono API]
        DB[(MongoDB)]
    end

    Clerk -->> User: Login
    User -->> API: Webhook (clerk-user-created)
    API -->> DB: upsertUser(metadata)
    API -->> API: Enrich Profile
```

---

## 🏁 Real-time Concurrency Logic

### Problem: Multiple users clicking "Start Match" at the same time.
### Solution: Distributed Locking & Atomic State.
1.  **Hono API** attempts to set a Redis lock for the `matchId`.
2.  The first request wins, the second is rejected with `409 Conflict`.
3.  The winner updates the `matchStatus` and broadcasts the update via the **Go Hub**.

---
*Status: System Flows Fully Mapped* 🛡️🏗️✨🚀📊📈🔥🎨🍿🏆🏁🏙️🌆
