# `contests` Table

**Purpose:**
Stores metadata about coding contests (both internal to the platform and external from platforms like Codeforces or LeetCode).

## Fields

- **`id`** (`uuid`, Primary Key): The internal unique ID for the contest.
- **`clist_id`** (`integer`, Unique): The external ID from the CLIST API, used for deduplication when syncing.
- **`title`** (`text`): The name of the contest.
- **`description`** (`text`): Optional description.
- **`platform`** (`text`): The host platform (e.g., `'leetcode'`, `'codeforces'`).
- **`start_time`** (`timestamp`): When the contest begins.
- **`end_time`** (`timestamp`): When the contest ends.
- **`duration`** (`integer`): Duration in seconds.
- **`href`** (`text`): The direct URL to the contest page.
- **`resource_id`** (`integer`): Internal ID for the platform in CLIST.
- **`icon`** (`text`): URL to the platform's icon.
- **`status`** (`text`): The current state (e.g., `'upcoming'`).
- **`created_at`** (`timestamp`): Record creation time.
- **`updated_at`** (`timestamp`): Record last update time.
