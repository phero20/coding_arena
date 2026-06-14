# `solutions` Table

**Purpose:**
Stores user-submitted markdown solutions and explanations for coding problems.

## Fields

- **`id`** (`uuid`, Primary Key): The internal unique ID.
- **`user_id`** (`uuid`, Foreign Key): References `users.id`. The author of the solution.
- **`problem_id`** (`text`): The MongoDB problem ID this solution applies to.
- **`problem_title`** (`text`): Cached problem title for faster rendering.
- **`problem_slug`** (`text`): Cached problem slug.
- **`title`** (`text`): The user's title for their solution post.
- **`content`** (`text`): The raw markdown content of the explanation and code.
- **`language`** (`text`): The primary language used (e.g., `'java'`, `'python'`).
- **`upvotes`** (`integer`): Current sum of upvotes.
- **`downvotes`** (`integer`): Current sum of downvotes.
- **`created_at`** (`timestamp`): When it was posted.
- **`updated_at`** (`timestamp`): When it was last edited.

*Note: Includes performance indexes on both `problem_id` and `user_id` to quickly fetch all solutions for a problem or all solutions by a user.*
