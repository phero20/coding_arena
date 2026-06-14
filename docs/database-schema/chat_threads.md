# `chat_threads` Table

**Purpose:**
Every system design diagram has an integrated AI Chat. This table tracks the different chat sessions (threads) associated with a specific diagram.

## Fields

- **`id`** (`uuid`, Primary Key): Internal unique ID.
- **`diagram_id`** (`uuid`, Foreign Key): References `diagrams.id`.
- **`title`** (`text`): Title of the chat thread.
- **`created_at`** (`timestamp`): Creation time.
- **`updated_at`** (`timestamp`): Last update time.

*Note: Includes an index on `diagram_id`.*
