# `bug_reports` Table

**Purpose:**
A standalone table used for collecting feedback, feature requests, and bug reports directly from users within the application UI.

## Fields

- **`id`** (`uuid`, Primary Key): Internal unique ID.
- **`title`** (`text`): A short summary of the issue.
- **`description`** (`text`): The detailed user feedback.
- **`type`** (`text`): Categorization (`'bug'`, `'ui'`, `'feature'`, `'feedback'`).
- **`images`** (`jsonb`): An array of strings containing Cloudinary image URLs if the user attached screenshots.
- **`status`** (`text`): Admin status of the ticket (`'open'`, `'in_progress'`, `'resolved'`, `'closed'`).
- **`created_at`** (`timestamp`): Creation time.
- **`updated_at`** (`timestamp`): Last update time.
