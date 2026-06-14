# Workspace Controllers

Controllers for the IDE workspace state.

**File Location**: [api/src/controllers/workspace/workspace.controller.ts](../../../api/src/controllers/workspace/workspace.controller.ts)

## Actions

1. **`getWorkspace`**
   - **Validation**: Extracts `problemId` from path and `userId` from authenticated context.
   - **Action**: Awaits `workspaceService.getWorkspace`.

2. **`updateWorkspace`**
   - **Validation**: Extracts `sourceCode`, `languageId`, and `layout` metrics from the request body.
   - **Action**: Awaits `workspaceService.updateWorkspace`.

3. **`getSettings` / `updateSettings`**
   - Extracts and validates IDE preferences like `fontSize`, `theme`, and `tabSize`.
