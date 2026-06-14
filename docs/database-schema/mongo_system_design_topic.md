# `SystemDesignTopic` MongoDB Collection

**Purpose:**
Stores the static markdown/HTML content for the "System Design" theory and tutorial pages.

## Fields

- **`topic_id`** (`String`, Unique): Internal ID.
- **`slug`** (`String`, Unique): URL-friendly route parameter.
- **`title`** (`String`): Display name of the tutorial.
- **`order`** (`Number`): Integer used to sort the chapters in the sidebar (indexed for speed).
- **`content`** (`String`): The massive Markdown/HTML payload containing the actual tutorial text and diagrams.
