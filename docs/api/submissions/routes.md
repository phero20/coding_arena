# Submissions Routes

The routing layer for running and submitting code.

**File Location**: [api/src/routes/submissions/submission.routes.ts](../../../api/src/routes/submissions/submission.routes.ts)

## API Endpoints

### 1. Execute Code ("Run Code")
- **Method**: `POST`
- **Path**: `/api/v1/submissions/execute`
- **Auth Required**: Yes (`requireAuth: true`)
- **Description**: Triggers a fast, synchronous execution of the user's code against the public sample test cases.

### 2. Submit Code ("Submit")
- **Method**: `POST`
- **Path**: `/api/v1/submissions/submit`
- **Auth Required**: Yes (`requireAuth: true`)
- **Description**: Triggers a full asynchronous evaluation against all hidden test cases. Returns a tracking token for polling.

### 3. Get Submission Token / Poll Status
- **Method**: `GET`
- **Path**: `/api/v1/submissions/token/:token`
- **Auth Required**: Yes (`requireAuth: true`)
- **Description**: The frontend polls this route every second to check if the background BullMQ worker has finished processing the submission token.

### 4. Fetch User Submissions Grid
- **Method**: `GET`
- **Path**: `/api/v1/submissions`
- **Auth Required**: Yes (`requireAuth: true`)
- **Description**: Fetches a paginated history of the user's past submissions.

### 5. Fetch Single Submission Detail
- **Method**: `GET`
- **Path**: `/api/v1/submissions/:id`
- **Auth Required**: Yes (`requireAuth: true`)
- **Description**: Fetches the full details of a past submission, including the exact source code submitted.
