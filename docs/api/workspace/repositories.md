# Workspace Repositories

The `WorkspaceRepository` handles MongoDB Mongoose operations for `Workspace` and `UserSettings` collections.

**File Location**: [api/src/repositories/workspace/workspace.repository.ts](../../../api/src/repositories/workspace/workspace.repository.ts)

## Responsibilities

1. **`findByUserAndProblem`**: Performs a fast lookup by `{ userId, problemId }`.
2. **`upsertWorkspace`**: Uses Mongoose's `{ upsert: true }` flag to cleanly insert or update the user's code and layout.
3. **`getUserSettings` / `upsertUserSettings`**: Standard queries for the global IDE config document.
