# `chat_messages` Table

**Purpose:**
Stores the individual message history within an AI System Design Chat Thread.

## Fields

- **`id`** (`uuid`, Primary Key): Internal unique ID.
- **`thread_id`** (`uuid`, Foreign Key): References `chat_threads.id`.
- **`role`** (`text`): Who sent the message (`'user'` or `'assistant'`).
- **`content`** (`text`): The text content of the message.
- **`created_at`** (`timestamp`): When the message was sent.

*Note: Includes an index on `thread_id`.*
