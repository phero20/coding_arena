# `users` Table

**Purpose:**
The `users` table is the central source of truth for user identity in the Coding Arena platform. It mirrors authentication data provided by Clerk and stores essential profile details.

## Fields

- **`id`** (`uuid`, Primary Key): The internal unique identifier for the user.
- **`clerk_id`** (`text`, Unique): The authentication ID provided by Clerk. This is critical for syncing webhooks.
- **`username`** (`text`, Unique): The user's public-facing handle.
- **`full_name`** (`text`): The user's actual name (optional).
- **`email`** (`text`, Unique): The user's email address.
- **`avatar_url`** (`text`): URL to the user's profile picture, generally synced from Clerk.
- **`status`** (`text`): The account status (default: 'active').
- **`role`** (`text`): Role-based access control (default: 'user', can be 'admin').
- **`github_username`** (`text`): Optional link to the user's GitHub profile.
- **`linkedin_username`** (`text`): Optional link to the user's LinkedIn profile.
- **`leetcode_username`** (`text`): Optional link to the user's LeetCode profile for stat syncing.
- **`created_at`** (`timestamp`): When the account was created.
- **`updated_at`** (`timestamp`): When the profile was last updated.
