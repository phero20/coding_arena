# `ProblemTest` MongoDB Collection

**Purpose:**
Separates the heavy, massive test cases from the `Problem` collection. Storing hundreds of hidden test cases (which can be megabytes in size) on the main problem document would make fetching problem descriptions incredibly slow.

## Fields

- **`problem_id`** (`String`): References the `Problem` collection.
- **`type`** (`String`): Categorization of the tests (`'public'`, `'hidden'`, `'stress'`, `'ai_eval'`). The UI only ever fetches the `public` ones. The Submission Worker fetches the `hidden` ones.
- **`cases`** (`Array`): An array of `TestCaseSchema` sub-documents.

### `TestCaseSchema`
- **`input`** / **`expected_output`** (`Mixed`): Can be strings, numbers, deeply nested arrays, or objects.
- **`timeout_ms`** / **`memory_limit_mb`** (`Number`): Per-test limits overriding global defaults.
- **`is_sample`** (`Boolean`): Flags if this test should be shown to the user on failure.
