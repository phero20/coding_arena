# `solution_votes` Table

**Purpose:**
A junction table to prevent users from upvoting or downvoting the same solution multiple times.

## Fields

- **`user_id`** (`uuid`, Primary Key, Foreign Key): References `users.id`.
- **`solution_id`** (`uuid`, Primary Key, Foreign Key): References `solutions.id`.
- **`vote_type`** (`integer`): `1` for upvote, `-1` for downvote.
- **`created_at`** (`timestamp`): When the vote was cast.

*Note: Uses a composite primary key `(user_id, solution_id)`.*
