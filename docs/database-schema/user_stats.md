# `user_stats` Table

**Purpose:**
The `user_stats` table acts as a highly aggregated cache for user metrics. It tracks leaderboards, solved problems by difficulty, and current activity streaks. It maintains a 1-to-1 relationship with the `users` table.

## Fields

- **`user_id`** (`uuid`, Primary Key, Foreign Key): References `users.id`. Cascades on delete.
- **`total_points`** (`bigint`): The primary metric used for global platform leaderboards.
- **`arena_points`** (`bigint`): Exclusive points earned in multiplayer combat (Arena mode).
- **`total_solved`** (`integer`): Overall number of unique problems successfully solved.
- **`easy_solved`** (`integer`): Total easy problems solved.
- **`medium_solved`** (`integer`): Total medium problems solved.
- **`hard_solved`** (`integer`): Total hard problems solved.
- **`arena_games`** (`integer`): Total number of multiplayer arena matches played.
- **`current_streak`** (`integer`): Consecutive days the user has solved at least one problem.
- **`best_streak`** (`integer`): The user's all-time highest consecutive day streak.
- **`last_solve_date`** (`date`): The date of the most recent successful submission. Used to calculate streaks.
- **`language_counts`** (`jsonb`): A dictionary mapping language names to the number of problems solved using them (e.g., `{"java": 5, "python": 2}`).
