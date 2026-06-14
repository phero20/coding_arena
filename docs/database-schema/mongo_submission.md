# `Submission` MongoDB Collection

**Purpose:**
A highly scalable log of every single execution request made by users across the platform.

## Fields

- **`problemId`** (`String`): The problem attempted.
- **`userId`** (`String`): The user who ran the code.
- **`languageId`** (`String`): E.g., `'71'` for Python, `'62'` for Java.
- **`sourceCode`** (`String`): The raw code submitted.
- **`status`** (`String`): Tracks the lifecycle (`'PENDING'` -> `'RUNNING'` -> `'ACCEPTED'`).
- **`time`** / **`memory`** (`Number`): Execution performance metrics.
- **`details`** (`Mixed`): A massive JSON object containing full `stdout`, `stderr`, and `compile_output` for every individual test case evaluated. Stored as `Mixed` because the schema varies wildly based on whether it failed compilation or crashed during execution.

*Note: Indexed heavily on `{ problemId: 1, userId: 1, createdAt: -1 }` to allow users to quickly fetch their past submission history for a specific problem.*
