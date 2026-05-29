# Frontend Architecture: Detailed Stack

The SlaveCode frontend is a specialized real-time platform. This document details the specific layers used to manage its high-concurrency state.

## 🏗 Modular Service Layer (`src/services`)

The data layer is split into **Queries** (Read) and **Mutations** (Write), ensuring a clear separation of concerns.

*   **`arena-socket.ts`**: The core WebSocket service that handles the raw `WebSocket` object and event dispatching.
*   **`arena-event-processor.ts`**: A middleware service that translates incoming Go Hub events into Zustand store updates.
*   **`submission.mutations.ts`**: Handles the code execution lifecycle (Submit -> Poll Result).
*   **`taxonomy.queries.ts`**: Fetches the recursive topic tree for the roadmap view.

## 🧠 State Orchestration (Zustand)

Global state is managed via specialized stores located in `src/store`:

1.  **`useArenaStore`**: The source of truth for match state, player scores, and timers.
2.  **`useEditorStore`**: Manages editor preferences and persists multi-language code buffers.
3.  **`useContestStore`**: Caches and filters upcoming contests from external platforms.
4.  **`useRoadmapStore`**: Manages the navigation state of the hierarchical curriculum.

## 🎣 Custom Hook Ecosystem (`src/hooks`)

We use high-level hooks to abstract complex domain logic:

### Real-time Hooks
*   **`useArenaSocket`**: Manages the connection lifecycle to the Go Hub.
*   **`useMatchCountdown`**: High-precision timer sync for live matches.
*   **`useTaskEvaluation`**: Orchestrates the process of running code against test cases and updating progress.

### Workspace Hooks
*   **`useMonacoConfig`**: Configures the Monaco editor with language-specific rules and themes.
*   **`usePracticeWorkspace`**: Manages the local state for individual (non-arena) problem solving.
*   **`useConsoleViewState`**: Manages the terminal output, test results, and difficulty metrics.

## 💅 Styling & Visual Excellence
*   **Design System**: Tailwind CSS + Shadcn UI primitives.
*   **Animations**: Framer Motion for room transitions and leaderboard re-orders.
*   **Theming**: Custom dark-mode optimized palette with high-contrast algorithmic syntax highlighting.
