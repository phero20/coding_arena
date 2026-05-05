# Frontend Architecture: Verified Pages & Routing

This document lists the actual, functional routes within the SlaveCode application.

## 🏠 Public & Main Pages

### `/` (Landing Page)
The primary entry point.
*   **Role**: Features the "SlaveCode" brand overview, highlighting real-time competitive programming.
*   **Component**: `HomeContent`

### `/arena` (Combat Hub)
The central zone for competitive matches.
*   **Role**: Provides two main actions: **Host Arena** (create a new sector) and **Join Arena** (enter via room code).
*   **Logic**: Uses `HostArenaCard` and `JoinArenaCard` to manage room entry.

### `/problems` (Practice Deck)
The algorithm problem library.
*   **Role**: Lists all available challenges for practice.
*   **Component**: `PracticeProblemList`

### `/roadmap` (Learning Path)
The hierarchical view of algorithmic patterns.
*   **Role**: Displays the Topic -> Pattern taxonomy for structured learning.

### `/leaderboard` (Global Rank)
The platform-wide performance tiers.

---

## ⚔️ Competitive Workspaces

### `/arena/lobby/[roomId]`
The pre-battle staging area.
*   **Role**: Used for player gathering, language selection, and match parameter configuration.

### `/arena/match/[roomId]`
The high-intensity coding arena.
*   **Role**: Integrates the Monaco Editor, Real-time Leaderboard, and the Judge0 execution terminal.
*   **Dynamic**: Redirects to Results when the match status transitions to `FINISHED`.

### `/watch/[matchId]`
Spectate mode for ongoing or past matches.

---

## 🔐 Auth & Identity

### `/auth/login` & `/auth/register`
Clerk-managed authentication flows.

### `/problems/[problemId]`
The detailed workspace for a single problem (Practice mode).

### `/u/[username]`
Dynamic user profile view (verified via the `u` routing subfolder).
