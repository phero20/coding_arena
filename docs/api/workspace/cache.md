# Workspace Cache Layer

The `WorkspaceCache` is arguably the most complex and important cache in the system. Because users "autosave" their code on almost every keystroke, writing directly to MongoDB would crash the database.

**File Location**: [api/src/cache/workspace/workspace.cache.ts](../../../api/src/cache/workspace/workspace.cache.ts)

## The Write-Through Debounce Strategy

Instead of standard caching, `WorkspaceCache` implements a deferred write strategy using Redis.

### 1. `updateWorkspace` (Autosave)
- When a user autosaves their code, the `WorkspaceCache` does **NOT** await the `WorkspaceService` to write to MongoDB.
- Instead, it overwrites the user's session data in Redis memory (`workspace:session:{userId}:{problemId}`).
- It then schedules a delayed flush to MongoDB using a background BullMQ queue (or similar debounce mechanism). This ensures that if a user types 100 characters, Redis absorbs 100 fast writes, but MongoDB only experiences 1 batch update.

### 2. `getWorkspace`
- On page load, it attempts to read the `workspace:session:{userId}:{problemId}` key from Redis.
- If it exists, it returns it instantly (guaranteeing they get their absolute latest code snippet).
- If it doesn't exist, it falls back to the `WorkspaceService` to query MongoDB.

This strategy ensures the editor feels instantaneous and the main database remains stable.
