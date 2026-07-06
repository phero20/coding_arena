# Chat Services

The `ChatService` handles the heavy lifting of maintaining conversational state, ensuring data security, and interfacing with the external One API Engine.

**File**: [api/src/services/chat/chat.service.ts](../../../api/src/services/chat/chat.service.ts)

## Key Responsibilities

### 1. Cross-Domain Security
Before a user can create a thread, read a message, or send a prompt, the service uses `verifyDiagramAccess` to communicate with the `WorkspaceService`. It strictly ensures that the user is the owner of the `diagramId` associated with the chat.

### 2. Dynamic Thread Creation
To provide a frictionless UX, the `sendMessage` method supports a dynamic "Option B". 
If the frontend passes `"new"` or `"temp-..."` as the `threadId`, the service will automatically extract the first 4 words of the user's prompt, generate a title, and create the thread in the database on-the-fly before sending the prompt to the AI.

### 3. Redis Conversational Memory (Sliding Window)
Instead of forcing the AI to remember context by querying the heavy PostgreSQL database on every single message, the service implements a highly efficient **Redis Sliding Window**:

1. **Cache Hit**: Checks `redis.lrange('chat:thread:messages:{threadId}', 0, -1)`.
2. **Cache Miss**: If empty, fetches the last 25 messages from Postgres, formats them into standard `{ role: "user" | "assistant", content: string }` arrays, and saves them to Redis using a `pipeline`.
3. **Execution**: Hands the array to the `AiDiagramService`.
4. **Cache Update**: Appends the new user prompt and new AI response to the Redis list using `rpush`, trims the list to exactly 25 messages using `ltrim`, and resets the TTL to 1 hour (`3600`).

### 4. Generative AI Handoff
The service delegates the actual LLM call to `groqDiagramService.generateDiagram()`. It provides:
- The raw user `prompt`.
- The Redis-cached `formattedHistory`.
- The semantic `canvasGraph` (The visual state of the user's diagram nodes and edges).

### 5. Persistent Storage
After the AI responds, the `ChatService` uses the `ChatRepository` to save both the `user` message and the `assistant` message to PostgreSQL for permanent storage.
