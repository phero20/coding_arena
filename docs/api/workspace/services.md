# Workspace Services

The `WorkspaceService` handles user-specific state for coding problems.

**File Location**: [api/src/services/workspace/workspace.service.ts](../../../api/src/services/workspace/workspace.service.ts)

## Responsibilities

1. **`getWorkspace`**: Fetches the user's saved code for a problem. **Crucial detail:** If a user has never opened this problem before, the service automatically checks the `Problem` repository for the default boilerplate code, initializes a new `Workspace` document with it, and returns it.
2. **`updateWorkspace`**: Validates the payload and updates the user's specific workspace document.
3. **`getSettings` / `updateSettings`**: Reads/Writes the user's global IDE settings.

The service is highly dependent on its wrapper (`workspace.cache.ts`) to handle the heavy read/write load effectively.
