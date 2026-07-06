# 🚀 SlaveCode: The Definitive Setup & Architecture Guide

Welcome to the **SlaveCode** technical documentation. This guide is designed to get you from a fresh clone to a fully functional competitive programming environment in minutes.

---

## 📁 1. Master Directory Map
Understanding where the logic lives is the first step to mastery.

| Folder | Name | Tech Stack | Role & Responsibility |
| :--- | :--- | :--- | :--- |
| **[`/api`](api)** | The Brain | Bun, Hono, Drizzle, Postgres, Mongo, Redis | **Central REST API**: Coordinates authentication via Clerk, manages problem banks, serves code execution logic, routes AI diagram queries, processes solution submissions, and updates Postgres database stats. |
| **[`/arena`](arena)** | The Heart | Go, Fiber, Redis | **Real-time Engine**: A high-concurrency WebSocket server that manages lobbies, processes real-time leaderboard scores, matches competitive programming battle players, and handles Pub/Sub events. |
| **[`/web`](web)** | The Face | Next.js 15+, Zustand | **Frontend UI**: Responsive React web client hosting the coding interface (Monaco Editor), System Design whiteboard editor (Tldraw), multiplayer dashboard panels, and the Academy portal. |
| **[`/admin`](admin)** | The Operator | Next.js, TailwindCSS | **Admin Dashboard**: Portal interface enabling managers to create contest problems, manage categories taxonomy, audit AI verdicts feedback logs, and moderate user profiles. |
| **[`/driver`](driver)** | The Bridge | Java, C++, C, Go, Rust... | **Compiler Adapter**: Wraps student and competitor code into language-specific compiler templates and execution packages before dispatching them safely to the Judge0 sandbox. |
| **[`/cloud`](cloud)** | The Orchestrator | TypeScript | **Cloud Controller**: VM provisioner handling scaling, health inspection, and start/stop automation scripts of remote sandbox servers running on Azure. |
| **[`/infra`](infra)** | The Blueprint | Docker | **Container Infrastructure**: Production-ready docker-compose files, Dockerfiles, and environment config recipes to containerize and deploy microservices. |
| **[`/envexamples`](envexamples)** | The Vault | Config | **Env Templates**: Holds standard environment templates (`.env.example`) to ensure consistent configuration keys and values across the REST API, Frontend, and WebSocket nodes. |
| **[`/docs`](docs)** | The Source | Markdown, PNG | **Technical Documents**: Complete reference manual containing project setup workflows, UML sequence/activity/class/usecase diagrams, database ERDs, and caching key architectures. |
| **[`/testings`](testings)** | The Guard | TS/JS | **Quality Checks**: System integration scripts to verify correct network handshakes, database client pools connection status, and basic endpoint accessibility. |
| **[`/scratch`](scratch)** | The Scratchpad | Markdown | **Developer Sandbox**: Area hosting temporary local mock test cases, draft notes, configuration testing files, and scratch scripts for developer experiments. |
| **[`/scripts`](scripts)** | The Tools | Bash / Node | **Automation Utilities**: Houses bash shell tools and Node modules to automate database seeding, execute Drizzle migrations, and maintain Docker networks. |

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

| Target Path | Source Template |
| :--- | :--- |
| **[`api/.env`](api/.env)** | **[`envexamples/.env.api.example`](envexamples/.env.api.example)** |
| **[`web/.env`](web/.env)** | **[`envexamples/.env.web.example`](envexamples/.env.web.example)** |
| **[`arena/.env`](arena/.env)** | **[`envexamples/.env.arena.example`](envexamples/.env.arena.example)** |

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

## 🏗 6. The Infrastructure & Integrations (Deep Dive)
SlaveCode uses a hybrid infrastructure strategy to balance flexibility, relational integrity, and heavy computational requirements:

### 🗄️ Databases & Caching
1.  **PostgreSQL (Neon/Relational)**: Managed via **Drizzle ORM**. High-integrity data (user profiles, points/stats, activity tracking).
2.  **MongoDB (Document - Atlas Cloud)**: Managed via **Mongoose**. Stores the vast competitive programming problem bank, complex test cases, archived match logs, and the migrated Academy curriculum.
3.  **Redis / Valkey (In-Memory)**: The "glue" for real-time. Manages lobby states, match timers, and inter-service messaging via Pub/Sub.

### 🛡️ Authentication
4.  **Clerk (Identity Management)**: Handles all user authentication, login, and session management. The Next.js frontend utilizes Clerk's React SDK, while the Node (Hono) API and Go WebSockets protect their routes by cryptographically validating Clerk JWTs using the `CLERK_PEM_PUBLIC_KEY`.

### ⚙️ Execution Engine
5.  **Judge0 (Dockerized Sandbox)**: The core code execution engine. It safely compiles and runs user submissions against hidden test cases inside isolated sandboxes to prevent malicious code from harming the server. 

### 🧠 AI Integrations (One API Gateway)
6.  **One API Gateway (Gemini, Groq, GPT, Deepseek and more)**: Acts as the centralized, unified router for all AI features in the system. It load-balances and manages API credentials, routing requests to: AI models used for heavy operations like system design diagram analysis, chat history, and problem importing/rewriting.
    High-speed fallback models for instant evaluations.
7.  **Unified AI Judging**: If Judge0 fails a submission due to strict formatting differences (e.g. trailing whitespaces) or does not support a specific language, the Hono API falls back to evaluating logical correctness using these gateway models with an automated multi-stage fallback queue.

---

## 🧪 7. Verification
Once everything is up, run the **[health check](testings/health.test.ts)** to verify the entire "Handshake" between services:
```bash
bun --env-file=api/.env run testings/health.test.ts
```
**Expected Results**:
- `API [3000]` -> `HEALTHY`
- `ARENA [8080]` -> `HEALTHY`
- `DB CONNECTION` -> `ESTABLISHED`
