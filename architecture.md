# SlaveCode Architecture & Documentation

Welcome to the SlaveCode Architecture documentation. This directory contains a comprehensive suite of dynamically rendered Mermaid.js diagrams that accurately map out the physical codebase, infrastructure, and business logic of the entire platform.

Because these are built with Mermaid, they render natively in GitHub and markdown viewers, ensuring they remain version-controlled and easy to maintain.

---

## 🏗️ Structural Diagrams (The "What")
These diagrams explain how the code is physically structured, how modules are wired, where things are deployed, and the data schema.

- **[System Architecture](system_architecture.md)**
  High-level overview of how the Next.js Frontend, Node (Hono) API, Go WebSockets, Redis, and Databases all communicate.
  
- **[Component Diagram](component_diagram.md)**
  Shows the internal wiring of the Node API (Controllers -> Services -> DB/Queue).

- **[Deployment Diagram](deployment_diagram.md)**
  Maps out the physical infrastructure (Docker, Google VMs, Vercel, Neon Postgres, MongoDB Atlas, Aiven Redis).

- **[Database ERD](database_erd.md)**
  Massive, 100% accurate Entity-Relationship Diagram detailing the PostgreSQL schema and MongoDB Document structures.

- **[Class Diagram](class_diagram.md)**
  Deep-dive Object-Oriented overview detailing all 70+ classes, services, models, and their precise methods.

---

## ⚡ Behavioral Diagrams (The "How")
These diagrams explain how data flows over time, the branching logic of background workers, and how state transitions occur.

- **[Sequence Diagram](sequence_diagram.md)**
  Step-by-step mapping of the asynchronous BullMQ code submission flow, and the real-time WebSocket connection sync.

- **[Activity Diagram](activity_diagram.md)**
  Flowcharts documenting complex `if/else` logic, such as the Submission AI Audit Fallback mechanism and the Academy Taxonomy locking logic.

- **[State Machine Diagram](state_machine_diagram.md)**
  Visualizes the exact lifecycle and statuses of a Code Submission (`PENDING` -> `ACCEPTED`) and an Arena Multiplayer Match (`WAITING` -> `PLAYING` -> `FINISHED`).

- **[Use Case Diagram](use_case_diagram.md)**
  Defines the exact permissions and platform capabilities split between unauthenticated Guests and authenticated Users.

---

## 🛠️ Tech Stack Overview
- **Frontend**: Next.js, React, TailwindCSS, Zustand, Monaco Editor
- **Core API Backend**: Node.js, Hono, Drizzle ORM, Mongoose, BullMQ
- **Real-Time Multiplayer**: Golang, Fiber WebSockets
- **Execution & AI Engine**: Judge0 (Dockerized), One API Gateway (Gemini & Groq AI Fallbacks & Chat)
- **Databases**: PostgreSQL (Relational), MongoDB (Document/NoSQL), Redis (Pub/Sub & Caching)

