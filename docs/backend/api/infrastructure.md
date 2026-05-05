# Backend Infrastructure: Cache & Middleware

This document details the internal systems that ensure SlaveCode is fast, secure, and observable.

## ⚡ Caching Strategy (Redis)

We use a multi-tiered caching approach to reduce database load and ensure sub-100ms response times for critical paths.

### 1. Match State Cache (`cache/arena/`)
*   **Storage**: Redis Hashes and JSON strings.
*   **Logic**: Active `ArenaRoom` objects live exclusively in Redis while a match is in progress. They are only "flushed" to MongoDB once the match ends.
*   **Real-time**: High-frequency updates (player status changes) are handled via Redis for maximum throughput.

### 2. Taxonomy & Problem Cache (`cache/problems/`)
*   **Storage**: Redis Keys.
*   **Logic**: The `taxonomy/tree` and problem detail pages are cached after the first fetch.
*   **Invalidation**: The cache is invalidated when an Admin updates a problem or category.

### 3. Contest Cache (`cache/contest/`)
*   **Logic**: The list of upcoming contests is cached with a 1-hour TTL to prevent excessive external API calls.

---

## 🛡️ Middlewares

The API uses **Hono Middlewares** to enforce security and observability across all requests.

### 1. Security Layer (`middlewares/security/`)
*   **AuthMiddleware**: Validates Clerk JWTs and populates the user context.
*   **AuthorizationMiddleware**: Enforces Role-Based Access Control (RBAC) (e.g., `admin` only routes).
*   **RateLimitMiddleware**: Uses a **Sliding Window** algorithm backed by Redis to prevent API abuse (e.g., 5 submissions/min).

### 2. Observability Layer (`middlewares/observability/`)
*   **LoggerMiddleware**: Tracks request/response times and logs errors with unique Trace IDs.
*   **ErrorHandlingMiddleware**: Catch-all for `AppError` instances, ensuring consistent JSON error responses across the platform.

---

## 📚 Core Libraries (`libs/`)

*   **Redis Hub**: Centralized Redis client with built-in retry logic and circuit breakers.
*   **Logger**: A high-performance Pino-based logger with support for structured logging (JSON).
*   **Awilix Container**: Implements **Dependency Injection** (DI) to ensure all services and repositories are easily testable and decoupled.
