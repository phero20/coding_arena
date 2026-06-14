# `Company` MongoDB Collection

**Purpose:**
Stores metadata about tech companies and explicitly maps which coding problems are frequently asked in their interviews.

## Fields

- **`_id`**: Internal MongoDB ObjectId.
- **`slug`** (`String`, Unique): URL-friendly identifier (e.g., `'google'`).
- **`name`** (`String`): Display name (e.g., `'Google'`).
- **`imageUrl`** (`String`): Optional logo image URL.
- **`problem_ids`** (`Array` of `String`): A list of MongoDB Problem IDs associated with this company.

*Note: Includes an alphabetical index on `name` for UI sorting.*
