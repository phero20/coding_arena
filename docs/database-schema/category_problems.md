# `category_problems` Table

**Purpose:**
A junction table that maps problems (which are stored in MongoDB) to their respective taxonomic categories in PostgreSQL. This allows a single problem to belong to multiple categories (e.g., a problem could be tagged as both "Arrays" and "Two Pointers").

## Fields

- **`category_id`** (`uuid`, Primary Key, Foreign Key): References `categories.id`. Cascades on delete.
- **`problem_id`** (`text`, Primary Key): The unique string ID matching the MongoDB problem document.
- **`order`** (`integer`): Defines the logical progression/solve order of this problem within this specific category.

*Note: Uses a composite primary key `(category_id, problem_id)`.*
