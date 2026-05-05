# 🚀 SlaveCode: The Definitive Setup Guide

This document provides a comprehensive technical overview and step-by-step instructions for setting up the **SlaveCode** ecosystem.

---

## 📁 1. Project Architecture & Directory Map

The platform is a multi-service architecture designed for high-concurrency real-time competitive programming.

| Folder | Tech Stack | Role & Responsibility |
| :--- | :--- | :--- |
| **`/api`** | Bun, Hono, Drizzle, MongoDB | **Central Logic**: Manages the REST API, problem bank, user authentication, and persistent submissions. |
| **`/arena`** | Go, Fiber, Redis Lua | **Real-time Engine**: A high-performance WebSocket Hub that manages live match state and broadcasting. |
| **`/web`** | Next.js 14+, Zustand | **User Interface**: The React-based frontend featuring the Monaco Editor and real-time leaderboards. |
| **`/driver`** | Java, TypeScript | **Judging Engine**: Contains the zero-dependency language drivers that execute and evaluate user code. |
| **`/infra`** | Docker | **Environment Recipes**: Contains production-ready Dockerfiles for the API and Arena Hub services. |
| **`/docs`** | Markdown | **Project Encyclopedia**: Detailed architectural blueprints and API/Database references. |
| **`/envexamples`** | Config | **Templates**: Master `.env` templates for all three main services. |
| **`/testings`** | TS/JS | **Quality Assurance**: Scripts for health checks, load tests, and pipeline verification. |

---

## 📋 2. Global Prerequisites

Ensure your system meets these requirements before starting the setup:

*   **Runtimes**:
    *   **Bun**: [Install Bun](https://bun.sh/) (Primary runtime for JS/TS).
    *   **Go**: [Install Go 1.21+](https://go.dev/) (For the Arena Hub).
*   **Databases**:
    *   **Redis**: Required for the Arena Hub and API Caching.
    *   **PostgreSQL**: Primary relational storage for users and stats.
    *   **MongoDB**: Primary NoSQL storage for problems and match logs.
*   **Services**:
    *   **Clerk**: You must have a Clerk project for authentication.
    *   **AI (Optional)**: Gemini or Groq API keys for AI-assisted judging features.

---

## 🛠 3. Phase I: Environment Configuration

The system relies on three separate `.env` files. Templates are located in `/envexamples`.

1.  **Backend API**:
    ```bash
    cp envexamples/.env.api.example api/.env
    # Critical: Update DATABASE_URL, MONGODB_URI, and CLERK_SECRET_KEY
    ```
2.  **Frontend Web**:
    ```bash
    cp envexamples/.env.web.example web/.env
    # Critical: Update NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    ```
3.  **Arena Hub**:
    ```bash
    cp envexamples/.env.arena.example arena/.env
    # Critical: Update CLERK_PEM_PUBLIC_KEY (Found in Clerk Dashboard)
    ```

---

## 🏗 4. Phase II: Manual Module Setup (Step-by-Step)

### A. Backend API (`/api`)
1.  **Install**: `cd api && bun install`
2.  **Database Migration**:
    *   Synchronize the PostgreSQL schema:
    ```bash
    bunx drizzle-kit push
    ```
    *   *(Optional)* View your data: `bunx drizzle-kit studio`
3.  **Startup**: `bun run dev` (Starts on port `3000`)

### B. Arena Hub (`/arena`)
1.  **Install**: `cd arena && go mod download`
2.  **Startup**: `go run cmd/server/main.go` (Starts on port `8080`)
    *   *Note: Ensure Redis is running before starting the Hub.*

### C. Frontend Web (`/web`)
1.  **Install**: `cd web && bun install`
2.  **Startup**: `bun run dev` (Starts on port `3001`)

---

## 🐳 5. Phase III: Docker Setup (Alternative)

If you prefer a containerized environment for infrastructure:

1.  **Redis Only**: `docker-compose up redis -d`
2.  **Full Stack (API + Arena + Redis)**:
    ```bash
    # Note: Requires .env files to be populated first
    docker-compose up --build -d
    ```

---

## 🧪 6. Phase IV: Verification & Testing

Once all services are up, run the automated health check to verify the integration:

```bash
cd testings
bun run health.test.ts
```

### Manual Verification Checklist:
- [ ] **REST API**: Visit `http://localhost:3000/health`. Should return `HEALTHY`.
- [ ] **Frontend**: Visit `http://localhost:3001`. Should show the "SlaveCode" landing page.
- [ ] **WebSockets**: Open `/arena` in the frontend. Check the console for "WS connection handshake successful".
