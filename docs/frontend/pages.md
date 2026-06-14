# Frontend Pages & Route Map

The frontend of Coding Arena is built with **Next.js (App Router)**. This document outlines the application's page structure based on the `src/app/` directory.

## Root Application

- **`/`**: The landing page of the application.
- **`layout.tsx` / `global.css`**: The root layout wrapping the entire app, providing the global Context providers (Clerk, Redux, Theme).
- **`not-found.tsx` / `error.tsx`**: Global error handling boundaries.

---

## 📚 Academy (`/academy`)

Structured learning tracks and guided courses.

- **`/academy`**: Landing page for the Academy module.
- **`/academy/tracks`**: A list of all available learning tracks (e.g., "Frontend Developer", "Algorithms").
- **`/academy/tracks/[slug]`**: Details for a specific track, showing the syllabus.
- **`/academy/tracks/[slug]/exercises/[exerciseSlug]`**: The actual interactive coding exercise workspace.

---

## ⚔️ Arena (`/arena`)

Real-time multiplayer coding battles.

- **`/arena`**: Main dashboard showing active matches and match history.
- **`/arena/select`**: UI to configure and host a new match (select difficulty, language, etc).
- **`/arena/[roomId]`**: The Pre-match **Lobby**. Players wait here before the host starts the game.
- **`/arena/match/[roomId]`**: The active multiplayer workspace. This connects to the Go WebSockets server and renders the code editor + real-time player leaderboards.
- **`/arena/match/[roomId]/results`**: The post-match summary screen displaying ranks and score calculations.

---

## 🔐 Auth (`/auth`)

Authentication routes (Delegated heavily to Clerk).

- **`/auth/login/[[...sign-in]]`**: Login page.
- **`/auth/register/[[...sign-up]]`**: Sign up page.
- **`/auth/forgot-password`**: Password recovery.

---

## 🏢 Companies (`/companies`)

Interview prep categorized by tech companies.

- **`/companies`**: Grid of companies (Google, Meta, Amazon, etc.).
- **`/companies/[slug]/problems`**: A filtered list of problems frequently asked by a specific company.

---

## 💻 Compilers (`/compilers`)

- **`/compilers`**: A standalone, lightweight scratchpad for executing code without being tied to a specific problem.

---

## 🏆 Contests & Leaderboard

- **`/contests`**: Calendar of upcoming external coding contests (Codeforces, LeetCode) synced via the Contest Worker.
- **`/leaderboard`**: The global ranking page for the platform, sorted by points or streaks.

---

## 🧩 Problems (`/problems`)

The core single-player coding engine.

- **`/problems`**: The main problem set explorer (table with filters, tags, and pagination).
- **`/problems/[problemId]`**: The core coding workspace. Renders the problem description, code editor, test case runner, and submission panel.

---

## 🏗️ System Design (`/systemdesign`)

Interactive architecture diagrams and tutorials.

- **`/systemdesign`**: Landing page for System Design.
- **`/systemdesign/learn/[slug]`**: Static tutorial reading mode for specific topics.
- **`/systemdesign/workspace`**: A dashboard managing user-created diagrams.
- **`/systemdesign/workspace/[workspaceId]`**: A folder-like view of diagrams within a specific workspace.
- **`/systemdesign/workspace/[workspaceId]/diagram/[diagramId]`**: The active Excalidraw canvas + AI Chatbot interface.

---

## 👤 User Profiles (`/u`)

- **`/u/[username]`**: The public user profile showing the GitHub-style contribution heatmap, solved problems list, and recent activity.
- **`/settings`**: Private account settings (integrations, profile edits).

---

## 🔧 Misc

- **`/report-bug`**: Feedback and issue submission form.
- **`/roadmap`**: Platform feature roadmap.
- **`/privacy` / `/terms`**: Legal compliance pages.
