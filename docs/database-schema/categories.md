# `categories` Table

**Purpose:**
Manages the taxonomy of algorithms and data structures. It supports a hierarchical structure via a self-referencing parent ID, allowing for broad categories (e.g., "Dynamic Programming") and specific patterns (e.g., "Knapsack").

## Fields

- **`id`** (`uuid`, Primary Key): The internal unique ID.
- **`parent_id`** (`uuid`, Foreign Key): Self-referencing FK to `categories.id`.
- **`name`** (`text`): Display name (e.g., "Two Pointer").
- **`slug`** (`text`, Unique): URL-friendly string (e.g., "two-pointer").
- **`description`** (`text`): Optional description of the category.
- **`order`** (`integer`): Used to determine sorting in the UI.
- **`created_at`** (`timestamp`): Record creation time.

*Note: Includes an explicit index on `parent_id` (`categories_parent_id_idx`) because PostgreSQL does not auto-index foreign keys.*
