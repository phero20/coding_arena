# `Problem` MongoDB Collection

**Purpose:**
The massive, central collection storing all algorithm problem descriptions, boilerplates, and judging configurations. Stored in MongoDB because of the heavily nested schema constraints and varying code snippet configurations.

## Fields

- **`title`** (`String`): Display name.
- **`problem_id`** (`String`, Unique): Canonical internal ID.
- **`problem_slug`** (`String`, Unique): URL-friendly string used in the frontend router.
- **`difficulty`** (`String`): `'Easy'`, `'Medium'`, or `'Hard'`.
- **`topics`** (`Array` of `String`): List of string tags.
- **`description`** (`String`): Markdown or HTML content describing the problem.
- **`examples`** (`Array`): Sub-documents containing `example_text` and `images`.
- **`constraints`** / **`follow_ups`** / **`hints`** (`Array` of `String`).
- **`code_snippets`** (`Object`): A dictionary mapping languages (e.g., `'python'`, `'cpp'`) to the starter boilerplate code the user sees.
- **`problem_type`** (`String`): The mode of the problem (`'function'`, `'class'`, or `'interactive'`).
- **`function_signature`** / **`class_signature`**: Heavily nested schemas defining the strict input parameters and return types expected. Used by the Judge subsystem to automatically generate wrapper code.
- **`judging_policy`** (`Object`): Instructions for the Judge (e.g., `comparator_mode`, `output_order`).
- **`solutions`** (`String`): Serialized JSON array of AI-generated educational solutions.
- **`is_premium`** (`Boolean`): Paywall flag.

*Note: Includes a text index `problem_text_index` across `title`, `problem_slug`, and `topics` to power the platform's global search bar.*
