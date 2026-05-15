# 🚀 SlaveCode: The Definitive Setup & Architecture Guide

Welcome to the **SlaveCode** technical documentation. This guide is designed to get you from a fresh clone to a fully functional competitive programming environment in minutes.

---

## 📁 1. Master Directory Map
Understanding where the logic lives is the first step to mastery.

| Folder | Name | Tech Stack | Role & Responsibility |
| :--- | :--- | :--- | :--- |
| **`/api`** | The Brain | Bun, Hono, Drizzle, Mongo | **Central REST API**: Manages user authentication (Clerk), problem banks, and persistent analytics. |
| **`/arena`** | The Heart | Go, Fiber, Redis | **Real-time Engine**: A high-performance WebSocket hub that manages live match state and lobby broadcasting. |
| **`/web`** | The Face | Next.js 15+, Zustand | **Frontend UI**: The React-based platform featuring Monaco Editor and real-time dashboards. |
| **`/driver`** | The Bridge | Java,c++,c,go,rust... | **Execution Logic**: Wraps user code into language-specific test packages before sending to Judge0. |
| **`/infra`** | The Blueprint | Docker | **Environment Recipes**: Contains production-ready Dockerfiles for the backend services. |
| **`/envexamples`** | The Vault | Config | **Templates**: Master `.env` templates to ensure consistent configuration across environments. |
| **`/docs`** | The Source | Markdown, PNG | **Encyclopedia**: Architectural blueprints, UML diagrams, and system flow references. |
| **`/testings`** | The Guard | TS/JS | **Quality Assurance**: Automated health-check scripts to verify inter-service connectivity. |

---

## 🐳 2. Backend Setup (Docker-Powered)
We prioritize Docker for the backend to ensure a stable, sandboxed environment for our complex microservices.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- Environment files populated (See Section 4).

### The One-Command Launch
From the root directory, run:
```bash
docker-compose up --build -d
```
This command initializes the entire infrastructure:
1.  **API Service**: Starts on port `3000`.
2.  **Arena Hub**: Starts on port `8080`.
3.  **Redis Cache**: Starts on port `6379`.

---

## 🛠 3. Frontend Setup (Manual)
The frontend is run manually to allow for rapid HMR (Hot Module Replacement) and easier debugging during UI development.

### Steps
1.  **Enter the web directory**:
    ```bash
    cd web
    ```
2.  **Install dependencies**:
    ```bash
    bun install
    ```
3.  **Launch the development server**:
    ```bash
    bun run dev
    ```
    > [!IMPORTANT]
    > The frontend defaults to port **3001** to avoid a port conflict with the Dockerized API running on **3000**.

---

## 🔑 4. Environment Configuration
The ecosystem relies on three core `.env` files. You MUST copy these from `/envexamples` and populate them with your secrets.

| Target Path | Source Template | Critical Keys to Set |
| :--- | :--- | :--- |
| `api/.env` | `envexamples/.env.api.example` | `DATABASE_URL` (Postgres), `MONGODB_URI`, `CLERK_SECRET_KEY` |
| `web/.env` | `envexamples/.env.web.example` | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_API_URL` |
| `arena/.env` | `envexamples/.env.arena.example` | `CLERK_PEM_PUBLIC_KEY` |

---

## 🛰 5. Connectivity & Port Map
Ensure these ports are open and not occupied by other services:

| Service | Port | Protocol | Description |
| :--- | :--- | :--- | :--- |
| **Next.js Web** | `3001` | HTTP | The main user interface. |
| **Hono API** | `3000` | HTTP | The core backend service. |
| **Go Arena** | `8080` | WS/HTTP | WebSocket Match Hub. |
| **Redis/Valkey** | `6379` | TCP | Real-time Pub/Sub and caching. |
| **PostgreSQL** | `5432` | TCP | Relational data (Neon). |
| **MongoDB** | `27017` | TCP | Problem bank and match logs. |
| **Judge0** | `2358` | HTTP | Code execution sandbox. |

---

## 🏗 6. The Database Stack (Deep Dive)
SlaveCode uses a hybrid persistence strategy to balance flexibility with relational integrity:

1.  **PostgreSQL (Neon/Relational)**:
    - **Purpose**: High-integrity data including user profiles, points/stats, and activity tracking.
    - **Logic**: Managed via **Drizzle ORM** for type-safe relational queries.
2.  **MongoDB (Document)**:
    - **Purpose**: Operational flexibility. Stores the vast problem bank, complex test cases, and archived match logs.
    - **Logic**: Managed via **Mongoose** for schema validation.
3.  **Redis / Valkey (In-Memory)**:
    - **Purpose**: The "glue" for real-time. Manages lobby states, match timers, and inter-service messaging via Pub/Sub.
    - **Note**: Supports high-performance alternatives like **Valkey** for production-grade concurrency.
4.  **Judge0 (Execution)**:
    - **Purpose**: The sandboxed engine that actually runs user code in a safe environment.

---

## 🧪 7. Verification
Once everything is up, run the health check to verify the entire "Handshake" between services:
```bash
cd testings
bun run health.test.ts
```
**Expected Results**:
- `API [3000]` -> `HEALTHY`
- `ARENA [8080]` -> `HEALTHY`
- `DB CONNECTION` -> `ESTABLISHED`
