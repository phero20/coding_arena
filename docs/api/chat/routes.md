# Chat Routes

The Chat routes define the API surface for the frontend to manage conversational threads and send messages to the AI assistant.

**File Location**: [api/src/routes/chat/chat.routes.ts](../../../api/src/routes/chat/chat.routes.ts)

## Dependencies Injected

The route registration function `registerChatRoutes` expects:
- `chatController`: Handles the HTTP logic.
- `authMiddleware`: Secures all Chat REST endpoints globally using `.use()`.

---

## API Endpoints

### 1. Create Thread
- **Method**: `POST`
- **Path**: `/api/v1/chat/threads`
- **Auth Required**: **Yes**
- **Validation**: Zod `createChatThreadSchema` (requires `diagramId` and optional `title`).
- **Controller Action**: `chatController.createThread`
- **Description**: Explicitly creates a new conversational thread tied to a specific System Design Diagram.

### 2. Get User Threads
- **Method**: `GET`
- **Path**: `/api/v1/chat/threads`
- **Auth Required**: **Yes**
- **Controller Action**: `chatController.getThreads`
- **Description**: Fetches all conversational threads belonging to the authenticated user. Usually filtered by `diagramId` via query parameters.

### 3. Delete Thread
- **Method**: `DELETE`
- **Path**: `/api/v1/chat/threads/:id`
- **Auth Required**: **Yes**
- **Controller Action**: `chatController.deleteThread`
- **Description**: Deletes a specific conversational thread and all its associated messages.

### 4. Get Thread Messages
- **Method**: `GET`
- **Path**: `/api/v1/chat/threads/:threadId/messages`
- **Auth Required**: **Yes**
- **Controller Action**: `chatController.getMessages`
- **Description**: Fetches the historical chat logs (messages) for a specific thread.

### 5. Send Message (AI Generation)
- **Method**: `POST`
- **Path**: `/api/v1/chat/threads/:threadId/messages`
- **Auth Required**: **Yes**
- **Validation**: Zod `createChatMessageSchema` (requires `prompt`, and optionally `diagramId` and `canvasGraph`).
- **Controller Action**: `chatController.sendMessage`
- **Description**: The core AI endpoint. Receives the user's prompt and the current semantic state of the canvas (`canvasGraph`), forwards it to the LLM via One API, and returns both a conversational text response and an array of executable `canvasActions`.
