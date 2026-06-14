# `user_solved_languages` Table

**Purpose:**
A granular tracking table that records not just *if* a user solved a problem, but *which languages* they used to solve it.

## Fields

- **`user_id`** (`uuid`, Primary Key, Foreign Key): References `users.id`.
- **`problem_id`** (`text`, Primary Key): The unique string ID matching the MongoDB problem document.
- **`language_id`** (`text`, Primary Key): The programming language used (e.g., `'java'`, `'python'`).
- **`solved_at`** (`timestamp`): When the problem was successfully solved in this specific language.

*Note: Uses a 3-part composite primary key `(user_id, problem_id, language_id)`. This allows the platform to reward users or show badges for solving a single problem in multiple different languages.*
