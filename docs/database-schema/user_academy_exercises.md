# `user_academy_exercises` Table

**Purpose:**
Tracks user progress through structured learning "Tracks" (Academy feature). It records which specific exercises within a track a user has completed.

## Fields

- **`user_id`** (`uuid`, Primary Key, Foreign Key): References `users.id`.
- **`track_slug`** (`text`, Primary Key): The unique slug for the learning track (e.g., `'data-structures'`).
- **`exercise_slug`** (`text`, Primary Key): The unique slug for the specific exercise inside the track.
- **`solved_at`** (`timestamp`): When the exercise was completed.

*Note: Uses a composite primary key `(user_id, track_slug, exercise_slug)` to mark completion status.*
