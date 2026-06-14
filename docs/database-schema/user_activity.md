# `user_activity` Table

**Purpose:**
The `user_activity` table logs daily aggregates of user actions. It is primarily used to generate the "GitHub-style" contribution heatmap on public user profiles.

## Fields

- **`user_id`** (`uuid`, Primary Key, Foreign Key): References `users.id`.
- **`date`** (`date`, Primary Key): The specific calendar day the activity occurred.
- **`points_earned`** (`integer`): Total standard points earned on this day.
- **`arena_points_earned`** (`integer`): Exclusive arena points earned on this day.
- **`submissions`** (`integer`): Total number of code submissions made on this day.
- **`matches`** (`integer`): Total number of arena matches played on this day.

*Note: This table uses a composite primary key consisting of `(user_id, date)` for high-performance time-series lookups.*
