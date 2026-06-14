# `diagrams` Table

**Purpose:**
Stores the actual Excalidraw or system architecture document state.

## Fields

- **`id`** (`uuid`, Primary Key): Internal unique ID.
- **`workspace_id`** (`uuid`, Foreign Key): References `workspaces.id`. The folder this diagram belongs to.
- **`title`** (`text`): The name of the diagram document.
- **`document_state`** (`jsonb`): Stores the raw Excalidraw JSON representing shapes, arrows, and text.
- **`created_at`** (`timestamp`): Creation time.
- **`updated_at`** (`timestamp`): Last update time.

*Note: Includes a performance index on `workspace_id`.*
