# React Hooks: Workspace

The `workspace/` directory orchestrates the behavior of the complex IDE interfaces across the application (Practice mode, Arena mode, and Compiler mode).

These hooks heavily rely on Redux to maintain state so that users don't lose their code if they navigate away and come back.

## Editor & Execution
- **`use-problem-editor.ts`**: Binds the Monaco Editor instance to local storage/Redux. Injects the starting boilerplate based on the selected language.
- **`use-monaco-config.ts`**: Configures the theme, font size, minimap, and autocomplete suggestions for the Monaco Editor instance.
- **`use-task-evaluation.ts`**: Coordinates the "Run Code" and "Submit" buttons, showing loading spinners while polling `use-submission.queries.ts`.
- **`use-console-view-state.ts`**: Manages the bottom resizable panel (Test Cases vs. Execution Results).

## Workspace Modes
- **`use-practice-workspace.ts`**: State manager for standard single-player problem solving.
- **`use-arena-match.ts`**: State manager for the multiplayer mode. Automatically locks the editor if the match hasn't started or has already ended.
- **`use-compiler-workspace.ts`**: State manager for the standalone scratchpad (no specific problem context).
- **`use-workspace-tabs.ts`**: Manages UI tabs (e.g., Description, Solutions, Submissions) in the left panel.

## System Design
- **`use-diagram-auto-save.ts`**: Used in the System Design workspace to debounce and automatically save the Excalidraw JSON payload every few seconds without user intervention.
- **`use-workspace-sync.ts`**: Ensures multiple tabs/windows stay in sync.
