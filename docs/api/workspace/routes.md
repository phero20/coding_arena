# Workspace Routes

The routing layer for editor sessions and user settings.

**File Location**: [api/src/routes/workspace/workspace.routes.ts](../../../api/src/routes/workspace/workspace.routes.ts)

## API Endpoints

### 1. Get Workspace Data
- **Method**: `GET`
- **Path**: `/api/v1/workspace/:problemId`
- **Auth Required**: Yes (`requireAuth: true`)
- **Controller Action**: `workspaceController.getWorkspace`
- **Description**: Fetches the user's saved code, selected language, and editor layout for a specific problem. If no workspace exists, it creates a default one.

### 2. Save Workspace State
- **Method**: `PUT`
- **Path**: `/api/v1/workspace/:problemId`
- **Auth Required**: Yes (`requireAuth: true`)
- **Controller Action**: `workspaceController.updateWorkspace`
- **Description**: Autosaves the user's current code string, language, and layout.

### 3. Get Global Settings
- **Method**: `GET`
- **Path**: `/api/v1/workspace/settings/global`
- **Auth Required**: Yes (`requireAuth: true`)
- **Controller Action**: `workspaceController.getSettings`
- **Description**: Fetches the user's global IDE preferences (e.g., Font Size, Keybinding mode, Theme).

### 4. Update Global Settings
- **Method**: `PUT`
- **Path**: `/api/v1/workspace/settings/global`
- **Auth Required**: Yes (`requireAuth: true`)
- **Controller Action**: `workspaceController.updateSettings`
- **Description**: Updates the user's global IDE preferences.
