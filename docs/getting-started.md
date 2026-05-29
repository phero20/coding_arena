# Getting Started

Follow these steps to set up the SlaveCode development environment on your local machine.

## 📋 Prerequisites

*   **Runtime**: [Bun](https://bun.sh/) (Backend) and [Node.js](https://nodejs.org/) (Frontend).
*   **Databases**: MongoDB, PostgreSQL, and Redis.
*   **Services**: A [Clerk](https://clerk.com/) account for authentication.

## 🚀 Environment Setup

The project uses modular `.env` files. We have provided templates in the `/envexamples` directory.

### 1. Backend API
```bash
cd api
cp ../envexamples/.env.api.example .env
# Open .env and fill in your CLERK_SECRET_KEY, DATABASE_URL, and MONGODB_URI
```

### 2. Frontend Web
```bash
cd web
cp ../envexamples/.env.web.example .env
# Fill in NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

### 3. Arena Hub (Go)
```bash
cd arena
cp ../envexamples/.env.arena.example .env
# Ensure the CLERK_PEM_PUBLIC_KEY is correctly pasted with quotes and newlines.
```

## 🏗 Installation

### Install Dependencies
Run this in the root directory to install all workspace dependencies:
```bash
bun install
```

### Database Migration
Initialize your PostgreSQL schema using Drizzle:
```bash
cd api
bun run db:push
```

## 🏁 Running the Project

You will need to start three main components:

1.  **API**: `cd api && bun run dev`
2.  **Web**: `cd web && bun run dev`
3.  **Arena Hub**: `cd arena && go run cmd/main.go` (Requires Go installed)

---

## 🛠 Useful Commands
*   **Test Generator**: `bun driver/test-generator.ts` (Generates Java test cases for local testing).
*   **DB Studio**: `cd api && bun run db:studio` (Visualizes your PostgreSQL data).
