# `follows` Table

**Purpose:**
A simple junction table managing the social graph. It tracks which users are following which other users.

## Fields

- **`follower_id`** (`uuid`, Primary Key, Foreign Key): References `users.id`. The user who is doing the following.
- **`following_id`** (`uuid`, Primary Key, Foreign Key): References `users.id`. The user who is being followed.
- **`created_at`** (`timestamp`): When the follow action occurred.

*Note: Uses a composite primary key `(follower_id, following_id)` to prevent a user from following the same person multiple times.*
