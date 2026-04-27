# 🚀 Coding Arena: Technology Stack Deep-Dive

This document explores the "Engine Room" of the **Coding Arena** platform, detailing the libraries, frameworks, and patterns used to power high-scale coding competitions.

---

## 🛡️ Hono/TypeScript API (`/api`)

The primary backend is a **Typescript** API built on **Hono**, designed to run on the high-performance **Bun** runtime.

### 🏛️ Dependency Injection Pattern
We use **Awilix** for enterprise-grade dependency injection. 
- **Registry**: Each layer (Controllers, Services, Repositories) has its own `registry.ts`.
- **Cradle**: The `ICradle` interface acts as the central source of truth for all components.
- **Benefits**: Decoupled initialization, easy swapping for tests (Mocking), and improved component lifecycle management.

### 📦 Key Libraries & Their Roles
| Library | Purpose | Benefit |
| :--- | :--- | :--- |
| **Bun** | Runtime & Package Manager | Sub-10ms startup and native high-speed fetch/socket support. |
| **Hono** | Lightweight Web Framework | Blazing fast routing and extensive middleware ecosystem. |
| **Zod** | Schema Validation | 100% type safety for all incoming API data. |
| **BullMQ** | Async Job Processing | Reliable, Redis-backed queue for heavy code evaluations. |
| **Mongoose** | MongoDB ODM | Stable, type-safe data modeling and validation. |

---

## 🏗️ Go Arena Engine (`/arena`)

The real-time match synchronization is handled by a dedicated **Go** service, chosen for its superior concurrency primitives.

### 🧪 Concurrency Model
- **Goroutines**: Thousands of concurrent WebSocket clients are managed with lightweight threads.
- **Channels**: Non-blocking message passing for thread-safe broadcasting.
- **Sync/Hub Pattern**:
    - **Hub**: Manages the directory of rooms and active clients.
    - **Client**: Handles the read/write pumps for individual sockets.

### 📦 Key Modules
- **`redis`**: High-performance Redis client for state storage and Pub/Sub.
- **`go-redis`**: Native Go support for complex Redis operations.
- **`slog`**: Structured logging for observability across high-traffic events.

---

## 📡 Messaging & Synchronization Layer

### 1. Redis Pub/Sub
To keep the two backends in sync without tight coupling, we use **Redis Pub/Sub**:
- **API -> Redis**: When a match starts or a problem changes, the Hono API publishes to the `arena:room:updates` channel.
- **Redis -> Arena**: The Go service subscribes to this channel and broadcasts the update to all connected WebSocket clients in that room.

### 2. Distributed Job Queue (BullMQ)
- **Primary Queue**: `submission_queue` handles coding submissions.
- **Worker Logic**: Decouples result calculation from API response time, allowing for a smooth UX even during heavy load.

---

## 📊 Database Strategy
| DB | Purpose | Rationale |
| :--- | :--- | :--- |
| **MongoDB** | Metadata & User Data | Flexible schema for complex coding problems and user profiles. |
| **Redis** | Real-time & Caching | In-memory Speed for match state, leaderboard, and session storage. |
| **PostgreSQL** | Relational Data | Structured data (logs, historical results) requiring strict integrity. |

---
*Status: Tech Stack Standardized & Robust* 🛡️🏗️✨🚀📊📈🔥🎨🍿🏆🏁🏙️🌆
