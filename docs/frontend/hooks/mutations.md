# React Hooks: Mutations

The `mutations/` directory abstracts all state-mutating API calls using `useMutation` from React Query (@tanstack/react-query). 

By isolating mutations in these hooks, the components remain clean and only have to call `mutate({ data })` without worrying about HTTP clients or cache invalidation logic.

## Files

### `use-academy.mutations.ts`
Handles user progress in the Academy feature.
- **`useSaveExerciseProgress`**: Calls the backend to mark a specific exercise as completed within a track. Invalidates the `academy-progress` query cache on success to instantly reflect the checkmark in the UI.

### `use-arena.mutations.ts`
Manages the multiplayer lifecycle.
- **`useCreateArenaMatch`**: POSTs to create a new room. Returns the `roomId`.
- **`useUpdateArenaRoomStatus`**: Mutates the active room state (e.g., locking the room, starting the match).
- **`useUpdateArenaMatchDuration`**: Allows the host to change the countdown timer before the match starts.

### `use-report-bug.mutations.ts`
- **`useSubmitBugReport`**: POSTs the bug report form data (including image URLs) to the database.

### `use-solution.mutations.ts`
- **`useCreateSolution`**: Submits a new markdown solution for a problem.
- **`useUpdateSolution`**: Edits an existing solution.
- **`useDeleteSolution`**: Removes a solution.
- **`useVoteSolution`**: Handles the upvote/downvote toggle logic. Optimistically updates the cache before the server responds to make the UI feel instant.

### `use-submission.mutations.ts`
- **`useSubmitCode`**: The core execution hook. POSTs raw code to the Execution Engine. On success, it frequently triggers polling in the queries layer to track execution status (PENDING -> RUNNING -> ACCEPTED).

### `use-workspace.mutations.ts`
- **`useCreateWorkspace`**: Creates a new System Design folder.
- **`useUpdateWorkspace`**: Renames a folder.
- **`useDeleteWorkspace`**: Removes a folder.
- **`useCreateDiagram`**: Creates a new Excalidraw document state.
- **`useSaveDiagram`**: Periodically POSTs the JSON payload from the Excalidraw canvas to PostgreSQL.

### `use-sync-leaderboard.ts`
- **`useSyncLeaderboard`**: An administrative/background hook to force a re-calculation of user rankings.
