# `user_solved_problems` Table

**Purpose:**
A junction table tracking which unique problems a user has successfully solved. This prevents users from earning duplicate points for solving the same problem multiple times.

## Fields

- **`user_id`** (`uuid`, Primary Key, Foreign Key): References `users.id`.
- **`problem_id`** (`text`, Primary Key): The unique string ID matching the MongoDB problem document.
- **`solved_at`** (`timestamp`): The exact time the user first successfully solved this problem.

*Note: This table uses a composite primary key consisting of `(user_id, problem_id)` to ensure each problem is only recorded as solved once per user.*
