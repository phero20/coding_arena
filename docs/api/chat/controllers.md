# Chat Controller

The `ChatController` standardizes the HTTP interactions between the client and the Chat Service. Like all controllers, it extends the `BaseController` and pulls its dependencies via Awilix.

**File**: [api/src/controllers/chat/chat.controller.ts](../../../api/src/controllers/chat/chat.controller.ts)

## `ChatController`

The controller acts as a strict gateway. It enforces authentication on every single action by explicitly checking for `req.user?.id` (which is populated by the upstream `authMiddleware`).

### Actions:

1. **`createThread`**
   - **Validation**: Enforces `userId` presence.
   - **Action**: Passes the `userId` and the JSON body (`CreateChatThreadInput`) to the service.

2. **`getThreads`**
   - **Validation**: Enforces that a `diagramId` is present in the HTTP query parameters.
   - **Action**: Calls `chatService.getThreadsByDiagramId()`.

3. **`deleteThread`**
   - **Validation**: Enforces `userId`.
   - **Action**: Extracts `id` from the URL parameters and deletes it via the service. Returns a generic `{ success: true }`.

4. **`getMessages`**
   - **Validation**: Enforces `userId`.
   - **Action**: Extracts `threadId` from the URL parameters and delegates to `chatService.getMessages()`.

5. **`sendMessage`**
   - **Validation**: Enforces `userId`.
   - **Action**: Extracts `threadId` from params and the Zod-validated payload from the body. Delegates the AI generation to `chatService.sendMessage()`.
