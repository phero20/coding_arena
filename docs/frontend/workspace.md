# Frontend Architecture: The Verified Workspace

The Workspace is the primary interactive surface of the application, designed for sub-second feedback loops during competitive programming.

## 💻 Editor Orchestration

We use the Monaco Editor with a custom persistence layer:

*   **Session Management**: Controlled via `useEditorStore`. Every problem has an isolated code buffer that persists even if the user refreshes the page.
*   **Configuration**: The `useMonacoConfig` hook handles theme injection and language-specific snippets (e.g., Boilerplate code for Java/Python).

## ⚙️ The Execution Pipeline (`useTaskEvaluation`)

When a user triggers "Run" or "Submit":

1.  **Preparation**: The `useProblemEditor` hook gathers the current code buffer and metadata.
2.  **Dispatch**: The code is sent via the `submission.mutations` service to the backend.
3.  **Feedback**: `useConsoleViewState` handles the transition from "Running" to displaying results. It parses the Judge0 output into pass/fail indicators.
4.  **Real-time Sync**: If in an Arena match, the passed test count is automatically sent to the Go Hub to update the live leaderboard.

## 🧩 UI Components

*   **`MatchWorkspace`**: The core container using `ResizablePanelGroup`. It synchronizes the Problem Statement (Markdown), Code Editor, and the Live Results Terminal.
*   **`ArenaLeaderboard`**: A specialized component that renders the rankings of all players in the room, animated via Framer Motion.
*   **`ArenaLobby`**: The staging area where `useArenaLobby` manages player ready states and host settings.

## 🕒 Performance Optimizations

*   **Debounced Sync**: Code progress is reported to the hub with a slight debounce to prevent WebSocket saturation during rapid typing.
*   **Lazy Rendering**: Large test case results are rendered using virtual lists to maintain 60FPS UI performance even with thousands of output lines.
