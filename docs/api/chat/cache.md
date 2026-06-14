# Chat Cache Layer (Sliding Window Memory)

Unlike other modules which use a separate cache directory and decorator pattern, the Chat module handles its Redis caching directly within the `ChatService`. This is because its caching strategy is tightly coupled to the logic required to feed the Groq LLM context.

**File Location**: [api/src/services/chat/chat.service.ts](../../../api/src/services/chat/chat.service.ts)

## The Redis Sliding Window

Every time a user interacts with the AI, the Groq LLM needs the recent conversation history to maintain context. Querying PostgreSQL for this history on every keystroke would be incredibly slow. Instead, the backend uses a **Redis Sliding Window**.

### How it Works:

1. **The Redis Key**
   - The thread memory is stored in a Redis List (`redis.lrange`, `redis.rpush`) under the key `chat:thread:messages:{threadId}`.

2. **Fetching Context (Cache Hit vs Miss)**
   - When a message is sent, the service first checks Redis (`redis.lrange(redisKey, 0, -1)`).
   - If empty (Cache Miss), it fetches the last 25 messages from PostgreSQL, reformats them into the expected `{ role, content }` array, and bulk-inserts them into Redis using a `pipeline`.

3. **Appending New Messages (`rpush`)**
   - After the LLM replies, both the new User prompt and the new AI text response are appended directly to the right side of the Redis list using `redis.rpush`.

4. **Trimming the Window (`ltrim`)**
   - **Crucial Memory Management**: To ensure the context never exceeds the LLM's token limit, the system immediately runs `redis.ltrim(redisKey, -25, -1)`. This forces Redis to drop the oldest messages and only keep exactly the 25 most recent messages in memory.

5. **Expiring Context (`expire`)**
   - The conversational context is given a Time-To-Live (TTL) of 3600 seconds (1 hour). If the user leaves the chat and comes back hours later, the memory will naturally purge itself from RAM, and seamlessly reload from Postgres on their next message.
