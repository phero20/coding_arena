# `workspaces` Table

**Purpose:**
Part of the System Design feature. A "Workspace" represents a folder or collection of system design diagrams created by a user.

## Fields

- **`id`** (`uuid`, Primary Key): Internal unique ID.
- **`user_id`** (`uuid`, Foreign Key): References `users.id`. The owner of the workspace.
- **`name`** (`text`): The name of the workspace.
- **`is_default`** (`boolean`): Flags the primary/default workspace created for every user upon signup.
- **`created_at`** (`timestamp`): Creation time.
- **`updated_at`** (`timestamp`): Last update time.

*Note: Includes a performance index on `user_id` to quickly load all workspaces for a specific user.*
