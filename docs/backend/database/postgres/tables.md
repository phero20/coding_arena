# Database Dictionary: PostgreSQL (Relational)

SlaveCode uses **PostgreSQL** with **Drizzle ORM** for its relational and analytics layer. This layer tracks user stats, social relationships, contests, and problem taxonomy.

## 👥 User Management

### `users` Table
The primary record for all registered players.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, Default Random | Internal system ID. |
| `clerk_id` | `text` | Unique, Not Null | Reference to the Clerk Auth identity. |
| `username` | `text` | Unique, Not Null | Display name used in the Arena. |
| `full_name` | `text` | - | User's real name. |
| `email` | `text` | Unique, Not Null | Primary contact email. |
| `avatar_url` | `text` | - | Profile image URL. |
| `status` | `text` | Default: `active` | Account status (active/suspended). |
| `role` | `text` | Default: `user` | ACL role (user/admin). |
| `github_username` | `text` | - | Linked Social identity. |
| `linkedin_username` | `text` | - | Linked Social identity. |
| `leetcode_username` | `text` | - | Linked Social identity. |
| `created_at` | `timestamp` | Default: `now()` | Registration date. |
| `updated_at` | `timestamp` | Default: `now()` | Last modification date. |

## 📊 Analytics & Stats

### `user_stats` Table
Aggregated metrics for leaderboards.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `uuid` | PK, FK (users) | Reference to user. |
| `total_points` | `bigint` | Default: 0 | Primary Leaderboard Metric. |
| `arena_points` | `bigint` | Default: 0 | Exclusive Arena Combat Points. |
| `total_solved` | `integer` | Default: 0 | Count of unique problems solved. |
| `easy_solved` | `integer` | Default: 0 | Sub-count for Easy problems. |
| `medium_solved` | `integer` | Default: 0 | Sub-count for Medium problems. |
| `hard_solved` | `integer` | Default: 0 | Sub-count for Hard problems. |
| `arena_games` | `integer` | Default: 0 | Count of arena matches played. |
| `current_streak` | `integer` | Default: 0 | Current consecutive solve days. |
| `best_streak` | `integer` | Default: 0 | All-time best solve streak. |
| `last_solve_date` | `date` | - | Date of the most recent solve. |
| `language_counts` | `jsonb` | Default: `{}` | Break down of solves per language. |

### `user_activity` Table
Powers the GitHub-style contribution graph.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `uuid` | Composite PK, FK | Reference to user. |
| `date` | `date` | Composite PK | The specific day of activity. |
| `points_earned` | `integer` | Default: 0 | Points gained on this day. |
| `arena_points_earned`| `integer` | Default: 0 | Arena points gained on this day. |
| `submissions` | `integer` | Default: 0 | Number of submissions on this day. |
| `matches` | `integer` | Default: 0 | Number of arena matches on this day. |

## 🏆 Contests

### `contests` Table
Stores external contest data synced from platforms like LeetCode/Codeforces.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK | Internal ID. |
| `clist_id` | `integer` | Unique, Not Null | External ID from CLIST API. |
| `title` | `text` | Not Null | Contest Name. |
| `platform` | `text` | Not Null | `leetcode`, `codeforces`, etc. |
| `start_time` | `timestamp`| Not Null | When the contest begins. |
| `end_time` | `timestamp`| Not Null | When the contest ends. |
| `duration` | `integer` | Not Null | Duration in seconds. |
| `href` | `text` | Not Null | Link to join the contest. |
| `status` | `text` | Default: `upcoming`| `upcoming`, `active`, `finished`. |

## 🏷 Taxonomy (Topics & Patterns)

### `categories` Table
Supports a **Recursive Tree Structure** for curriculum mapping.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK | Internal ID. |
| `parent_id` | `uuid` | FK (categories) | Reference to parent category. |
| `name` | `text` | Not Null | e.g., "Two Pointer". |
| `slug` | `text` | Unique, Not Null | URL-friendly slug. |
| `order` | `integer` | Default: 0 | Sort order in UI. |

### `category_problems` Table
Junction table linking Problems (MongoDB) to Categories (Postgres).
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `category_id` | `uuid` | Composite PK, FK | Reference to category. |
| `problem_id` | `text` | Composite PK | MongoDB `problem_id` string. |
| `order` | `integer` | Default: 0 | Step order in the curriculum. |
