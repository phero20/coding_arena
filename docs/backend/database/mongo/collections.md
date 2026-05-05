# Database Dictionary: MongoDB (NoSQL)

SlaveCode uses **MongoDB** for its core operational data, including problems, test cases, match results, and code submissions.

---

## 🧩 Problem Bank

### `Problem` Collection
Stores metadata and definitions for coding challenges.
*   **Model**: `ProblemModel`
*   **Collection**: `problems`

| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | `String` | Human-readable title. |
| `problem_id` | `String` | Unique numerical/string ID (Unique Index). |
| `frontend_id` | `String` | Display ID for the frontend. |
| `difficulty` | `Enum` | `Easy`, `Medium`, `Hard`. |
| `problem_slug` | `String` | URL-friendly slug (Unique Index). |
| `topics` | `[String]` | Array of associated tags/topics. |
| `description` | `String` | Markdown-formatted problem text. |
| `examples` | `[Example]` | Array of objects (example_num, text, images). |
| `constraints` | `[String]` | Array of problem constraints. |
| `follow_ups` | `[String]` | Potential follow-up questions. |
| `hints` | `[String]` | Scaffolding hints for users. |
| `code_snippets` | `Object` | Keyed by language (`python`, `java`, etc.). |
| `function_signature`| `Object` | Contains `name`, `return_type`, `params`, `param_order`. |
| `solutions` | `String` | Official solution code (if any). |

### `ProblemTest` Collection
Stores the actual execution data and test cases for a problem.
*   **Model**: `ProblemTestModel`
*   **Collection**: `problemtests`

| Field | Type | Description |
| :--- | :--- | :--- |
| `problem_id` | `String` | Reference to the Problem (Index). |
| `type` | `Enum` | `public`, `hidden`, `stress`, `ai_eval`. |
| `cases` | `[TestCase]` | Array of execution objects (see below). |

**`TestCase` (Nested Object):**
| Field | Type | Description |
| :--- | :--- | :--- |
| `input` | `Mixed` | The data sent to the solution's parameters. |
| `expected_output` | `Mixed` | The value the solution must return. |
| `timeout_ms` | `Number` | Max execution time before TLE. |
| `memory_limit_mb` | `Number` | Max memory before MLE. |
| `weight` | `Number` | Score weight for this specific test. |
| `is_sample` | `Boolean` | If true, it is shown to the user in the workspace. |

---

## ⚔️ Arena & Competitive

### `ArenaMatch` Collection
Historical and active records of competitive sessions.
*   **Model**: `ArenaMatchModel`
*   **Collection**: `arenamatches`

| Field | Type | Description |
| :--- | :--- | :--- |
| `roomId` | `String` | ID of the originating Redis room (Unique Index). |
| `hostId` | `String` | Clerk ID of the room creator (Index). |
| `problemId` | `String` | Reference to the Problem. |
| `status` | `Enum` | `WAITING`, `PLAYING`, `COMPLETED`. |
| `players` | `[Player]` | Array of results per participant (see below). |
| `startedAt` | `Date` | When the match timer started. |
| `endedAt` | `Date` | When the match was completed. |
| `expiresAt` | `Date` | TTL Index (Auto-deletes after 30 days). |

**`PlayerResult` (Nested Object):**
| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | `String` | Clerk ID. |
| `username` | `String` | Username at time of match. |
| `finalRank` | `Number` | Order of completion. |
| `verdict` | `Enum` | Final result (ACCEPTED, WRONG_ANSWER, etc.). |
| `score` | `Number` | Points earned in the match. |
| `testsPassed` | `Number` | Count of successful test cases. |
| `totalTests` | `Number` | Total test cases available. |

### `ArenaSubmission` Collection
Junction records linking submissions to a specific Arena Match.
| Field | Type | Description |
| :--- | :--- | :--- |
| `matchId` | `String` | Reference to the Match (Index). |
| `userId` | `String` | Clerk ID (Index). |
| `submissionId` | `String` | Reference to the standard Submission record. |
| `status` | `Enum` | Final result of the code. |
| `testsPassed` | `Number` | Success count. |
| `totalTests` | `Number` | Total count. |

---

## 📝 Submissions

### `Submission` Collection
The global record of every code execution attempt.
| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | `String` | Clerk ID (Index). |
| `problemId` | `String` | Reference to the Problem (Index). |
| `languageId` | `String` | Language used (e.g., `java`). |
| `status` | `String` | Final verdict (e.g., `Accepted`). |
| `runtime` | `Number` | Execution time in milliseconds. |
| `memory` | `Number` | Peak memory usage. |
| `sourceCode` | `String` | The code submitted by the user. |
