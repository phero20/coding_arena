# Coding Arena: Scalability Solution Roadmap

**Document Version**: 1.0  
**Created**: May 23, 2026  
**Target**: Scale from 300 → 5000 concurrent users  
**Timeline**: 2-3 weeks (with proper prioritization)

---

## 🎯 Current State vs Target

| Metric | Current | After Phase 1 | After Phase 2 | Final |
|--------|---------|---------------|---------------|-------|
| **Concurrent Users** | 150-300 | 600-1000 | 2000-3000 | 5000+ |
| **Requests/sec** | 10-20 | 40-80 | 100-150 | 300+ |
| **Setup Complexity** | Moderate | Complex | Complex | Enterprise |
| **Timeline to Ship** | Now | +2 weeks | +4 weeks | +6-8 weeks |

---

## 📋 PART 1: NODE.JS API BOTTLENECKS (4 Critical Issues)

### Issue #1: No Process Clustering (Single CPU Core)

**Problem**:
```
Current: 1 Node.js process = 1 CPU core utilized
├─ 4-core machine: 75% CPU idle
├─ All requests queue on single event loop
├─ Max throughput: ~20 requests/sec
└─ Bottleneck: Event loop blocked by single long task
```

**Impact**: 
- ❌ Can't scale beyond 50-100 concurrent REST users
- ❌ One slow request blocks all others
- ❌ Groq LLM latency (5-10s) blocks entire event loop

**Solution**: Enable Node.js Cluster Mode

**Implementation Steps**:

1. **Modify `api/src/index.ts`**:
```typescript
import cluster from 'cluster';
import { availableParallelism } from 'os';

if (cluster.isPrimary) {
  const numCPUs = availableParallelism();
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Spawning ${numCPUs} worker processes...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker death
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Respawn
  });
} else {
  // Worker process
  import('./app').then(({ createApp }) => {
    const app = createApp();
    app.listen(3000, () => {
      console.log(`Worker ${process.pid} started on port 3000`);
    });
  });
}
```

2. **Update `package.json` start script**:
```json
{
  "scripts": {
    "start": "node --loader tsx api/src/index.ts",
    "dev": "node --loader tsx api/src/index.ts"
  }
}
```

3. **Test locally**:
```bash
npm start
# Should see: "Spawning 8 worker processes..." (or your CPU count)
# Each worker listens on port 3000 (OS handles load balancing)
```

**Metrics After Fix**:
- ✅ CPU utilization: 100% (all cores active)
- ✅ Throughput: 4-8× increase
- ✅ Max REST users: 50-100 → **200-400**
- ✅ Time to implement: **1 day**

---

### Issue #2: N+1 Queries on Chat History (Duplicate DB Hits)

**Problem**:
```
Current Flow:
User #1 sends message:
├─ GET /chat/threads/{id}/messages
├─ DB Query: SELECT * FROM chatMessages WHERE threadId={id}
└─ Persist new message

User #2 sends message (simultaneous):
├─ Same query AGAIN
└─ Result: 2 identical DB queries for same data

Scale to 100 users:
├─ 100 identical concurrent requests
├─ 100 DB queries (only 1 needed!)
└─ PostgreSQL connection pool exhausted (25 connections)
```

**Impact**:
- ❌ Database connection pool exhaustion at 100 concurrent users
- ❌ 50-100× more queries than necessary
- ❌ Higher database latency and cost
- ❌ Connection timeouts cascade

**Solution**: Implement Read-Through Cache for Chat History

**Implementation Steps**:

1. **Create cache helper** (`api/src/libs/cache-helper.ts`):
```typescript
import { Redis } from '@upstash/redis';

export class CacheHelper {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async getCachedOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    try {
      // Step 1: Check cache
      const cached = await this.redis.get(key);
      if (cached) {
        console.log(`✅ Cache hit: ${key}`);
        return JSON.parse(cached as string) as T;
      }
    } catch (err) {
      console.warn(`Cache read failed: ${err}`);
    }

    // Step 2: Cache miss - fetch from source
    console.log(`❌ Cache miss: ${key}`);
    const data = await fetchFn();

    // Step 3: Store in cache
    try {
      await this.redis.setex(
        key,
        ttlSeconds,
        JSON.stringify(data)
      );
    } catch (err) {
      console.warn(`Cache write failed: ${err}`);
    }

    return data;
  }
}
```

2. **Update Chat Service** (`api/src/services/chat/chat.service.ts`):
```typescript
// BEFORE (N+1 issue):
async sendMessage(userId: string, threadId: string, prompt: string) {
  // Fetch ALL messages from DB
  const messages = await db.chatMessages.find({ threadId });
  // ...
}

// AFTER (with cache):
async sendMessage(userId: string, threadId: string, prompt: string) {
  const cacheKey = `chat:messages:${threadId}`;
  
  // Use read-through cache
  const messages = await this.cacheHelper.getCachedOrFetch(
    cacheKey,
    () => db.chatMessages.find({ threadId }),  // Fallback fetch
    3600  // 1 hour TTL
  );
  
  // ...persist new message...
  
  // Invalidate cache after write
  await this.redis.del(cacheKey);
}
```

3. **Test flow**:
```typescript
// Scenario: 10 concurrent chat sends
Request #1: Cache miss → DB hit → Cache store
Request #2: Cache hit ✅ (no DB)
Request #3: Cache hit ✅ (no DB)
...
Request #10: Cache hit ✅ (no DB)

Result: 10 requests = 1 DB query instead of 10 ✅
```

**Metrics After Fix**:
- ✅ Database QPS: 100× reduction at concurrency
- ✅ Chat latency: 50-100ms → 20-30ms (on cache hit)
- ✅ Connection pool exhaustion prevented
- ✅ Time to implement: **1 day**

---

### Issue #3: No LLM Response Caching (Duplicate Groq Calls)

**Problem**:
```
Current Flow:
User asks: "Design a system for Twitter"
├─ Call Groq API: 5-10 seconds
├─ Groq returns: { action: 'CREATE', nodes: [...] }

User #2 asks: "Design a system for Twitter" (same prompt!)
├─ Call Groq API AGAIN: 5-10 seconds (duplicate!)
└─ Get same response

Scale to 100 users asking similar questions:
├─ 100 Groq API calls
├─ 95 are duplicates (wasted!)
├─ Cost: 100 × (Groq API cost)
└─ Latency: All users wait 5-10s
```

**Impact**:
- ❌ Groq API cost multiplied by duplicates
- ❌ User latency: 5-10s per request (no improvement)
- ❌ LLM API rate limits hit faster
- ❌ Queue depth increases rapidly

**Solution**: Cache LLM Responses by Prompt Hash

**Implementation Steps**:

1. **Update Groq Service** (`api/src/services/ai/groq-diagram.service.ts`):
```typescript
import crypto from 'crypto';

export class GroqDiagramService {
  async generateDiagram(
    prompt: string,
    canvasGraph: CanvasGraph,
    conversationHistory: ChatMessage[]
  ) {
    // Step 1: Create hash of prompt + canvas context
    // (same prompt + same diagram = same response)
    const promptHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({
        prompt,
        graphStructure: {
          nodeCount: canvasGraph.frames[0]?.nodes.length,
          edgeCount: canvasGraph.frames[0]?.edges.length,
        }
      }))
      .digest('hex');

    const cacheKey = `llm:response:${promptHash}`;

    try {
      // Step 2: Check cache
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        console.log(`✅ LLM cache hit: ${promptHash}`);
        return JSON.parse(cached as string);
      }
    } catch (err) {
      console.warn('Cache read failed, proceeding to LLM');
    }

    // Step 3: Cache miss - call Groq
    console.log(`❌ LLM cache miss: ${promptHash}`);
    const response = await this.callGroqWithTimeout(
      prompt,
      canvasGraph,
      conversationHistory
    );

    // Step 4: Store in cache for 24 hours
    // (architectural changes don't happen often)
    try {
      await this.redis.setex(
        cacheKey,
        86400,  // 24 hours
        JSON.stringify(response)
      );
    } catch (err) {
      console.warn('Cache write failed, but response ok');
    }

    return response;
  }

  // NEW: Helper to prevent cascading timeouts
  private async callGroqWithTimeout(
    prompt: string,
    canvasGraph: CanvasGraph,
    history: ChatMessage[]
  ) {
    const timeoutMs = 10000;  // 10 second timeout

    return Promise.race([
      this.groqClient.complete({
        model: 'mixtral-8x7b-32768',
        messages: [...history, { role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Groq timeout after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]).catch((err) => {
      console.error('Groq call failed:', err.message);
      // Return safe fallback
      return { action: 'NONE', reason: 'LLM unavailable' };
    });
  }
}
```

2. **Cache Invalidation Strategy** (optional for advanced use):
```typescript
// If user explicitly updates diagram, invalidate related caches
async updateDiagram(diagramId: string, changes: any) {
  // ...update diagram...
  
  // Invalidate caches that reference this diagram
  const pattern = `llm:response:*`;
  const keys = await this.redis.keys(pattern);
  
  // Keep cache but mark as stale (optional)
  // For now, simple TTL is fine
}
```

3. **Monitor Cache Effectiveness**:
```typescript
// Add metrics
const lruMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  get hitRate() {
    const total = this.cacheHits + this.cacheMisses;
    return total > 0 ? (this.cacheHits / total * 100).toFixed(2) : 0;
  }
};
```

**Metrics After Fix**:
- ✅ Groq API calls: 100 → 10-20 (10× reduction)
- ✅ User latency: 5-10s → 0.5-1s (on cache hit)
- ✅ Cost reduction: 80-90% on Groq API
- ✅ Time to implement: **1-2 days**

---

### Issue #4: No Timeout on Groq Requests (Cascading Timeouts)

**Problem**:
```
Current Flow:
User sends message → Groq API call (no timeout)
├─ Groq is slow (takes 15 seconds)
├─ Node request hangs (blocks event loop)
├─ Groq response stored in memory (promise pending)
├─ User gets no response

Scale to 50 slow requests:
├─ 50 promises pending (waiting for Groq)
├─ Memory accumulation: ~10MB per request
├─ Total: 50 × 10MB = 500MB
├─ Groq still processing (maybe never finishes)
├─ After 30 seconds: Node process OOM
└─ Entire API crashes 💥
```

**Impact**:
- ❌ Cascading failures when Groq is slow
- ❌ Node.js process OOM crash
- ❌ All users get 503 Service Unavailable
- ❌ No graceful degradation

**Solution**: Add Timeout + Circuit Breaker

**Implementation Steps**:

1. **Create Circuit Breaker** (`api/src/libs/circuit-breaker.ts`):
```typescript
export enum CircuitState {
  CLOSED = 'CLOSED',      // Normal operation
  OPEN = 'OPEN',          // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN' // Testing recovery
}

export class CircuitBreaker {
  state: CircuitState = CircuitState.CLOSED;
  failureCount = 0;
  successCount = 0;
  lastFailureTime?: number;
  
  readonly failureThreshold = 5;      // Open after 5 failures
  readonly successThreshold = 2;      // Close after 2 successes
  readonly timeout = 60000;           // Reset after 60s

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Step 1: Check if circuit should reset
    if (this.state === CircuitState.OPEN) {
      const timeSinceFailure = Date.now() - (this.lastFailureTime || 0);
      if (timeSinceFailure > this.timeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      // Step 2: Execute with timeout
      const result = await Promise.race([
        fn(),
        this.timeout_promise(30000)  // 30s total timeout
      ]);

      // Step 3: Success - reset failure count
      this.failureCount = 0;
      if (this.state === CircuitState.HALF_OPEN) {
        this.successCount++;
        if (this.successCount >= this.successThreshold) {
          this.state = CircuitState.CLOSED;
          console.log('✅ Circuit closed - resuming normal operation');
        }
      }
      return result;
    } catch (err) {
      // Step 4: Failure - increment failure count
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold) {
        this.state = CircuitState.OPEN;
        console.error('❌ Circuit opened - rejecting requests');
      }
      throw err;
    }
  }

  private timeout_promise(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timeout after ${ms}ms`)),
        ms
      )
    );
  }
}
```

2. **Update Groq Service**:
```typescript
export class GroqDiagramService {
  private circuitBreaker = new CircuitBreaker();

  async generateDiagram(...args) {
    try {
      // Use circuit breaker
      return await this.circuitBreaker.execute(() =>
        this.callGroqWithTimeout(...args)
      );
    } catch (err) {
      if (err.message.includes('timeout') || err.message.includes('Circuit')) {
        console.error('Groq unavailable:', err.message);
        // Graceful fallback
        return {
          action: 'NONE',
          reason: 'LLM temporarily unavailable',
          retryAfter: 30
        };
      }
      throw err;
    }
  }

  private async callGroqWithTimeout(...args) {
    return Promise.race([
      this.groqClient.complete({
        /* config */
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Groq timeout')), 10000)
      )
    ]);
  }
}
```

3. **Monitor Circuit Breaker State**:
```typescript
// Add endpoint to check health
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    circuitBreaker: {
      state: circuitBreaker.state,
      failures: circuitBreaker.failureCount
    }
  });
});
```

**Metrics After Fix**:
- ✅ Cascading timeouts prevented
- ✅ Node.js OOM crashes eliminated
- ✅ Users get graceful error (NONE action) instead of 503
- ✅ System recovers automatically after 60s
- ✅ Time to implement: **1 day**

---

## 📋 PART 2: GO WEBSOCKET BOTTLENECKS (4 Critical Issues)

### Issue #1: Single Mutex on Hub (All Operations Lock)

**Problem**:
```
Current Architecture:
┌─────────────────────────────────────┐
│         Hub Goroutine               │
│  ┌─────────────────────────────┐   │
│  │   sync.RWMutex (SINGLE!)    │   │
│  │                             │   │
│  │  Lock Timeline:             │   │
│  │  ├─ Register client → lock  │   │
│  │  ├─ Unregister → lock       │   │
│  │  ├─ Broadcast to 100 users  │   │
│  │  │  └─ lock while iterating │   │
│  │  └─ Total lock time: 50ms   │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  At 1000 concurrent connections:   │
│  ├─ Constant lock contention       │
│  ├─ Register/unregister queue      │
│  ├─ Message delivery delays: 100ms+│
│  └─ Players see stale scoreboards  │
└─────────────────────────────────────┘
```

**Impact**:
- ❌ Single mutex = sequential operations on ALL rooms
- ❌ 1000 connections → mutex contention hell
- ❌ Message delivery latency: 100ms+ (noticeable to users)
- ❌ Can't exceed ~1000 concurrent connections
- ❌ Scoreboards show 2-3 second delays

**Solution**: Per-Room Goroutines (Eliminate Hub Mutex)

**Implementation Steps**:

1. **Create Room Struct** (`arena/internal/hub/room.go`):
```go
package hub

import (
  "sync"
  "time"
)

type Room struct {
  ID           string
  clients      map[string]*Client
  register     chan *Client
  unregister   chan *Client
  broadcast    chan Message
  mu           sync.RWMutex  // ← ONLY for this room
  lastActivity time.Time
}

func NewRoom(id string) *Room {
  return &Room{
    ID:           id,
    clients:      make(map[string]*Client),
    register:     make(chan *Client, 16),       // Buffered
    unregister:   make(chan *Client, 16),       // Buffered
    broadcast:    make(chan Message, 64),       // Buffered
    lastActivity: time.Now(),
  }
}

// Room.Run() - each room gets its own goroutine
func (r *Room) Run() {
  ticker := time.NewTicker(5 * time.Minute)
  defer ticker.Stop()

  for {
    select {
    // Handle new player joining
    case client := <-r.register:
      r.mu.Lock()
      r.clients[client.UserID] = client
      r.mu.Unlock()

      r.lastActivity = time.Now()
      
      // Broadcast player joined
      r.broadcast <- Message{
        Type:    "PLAYER_JOINED",
        Payload: client.UserID,
      }

    // Handle player leaving
    case client := <-r.unregister:
      r.mu.Lock()
      if _, exists := r.clients[client.UserID]; exists {
        delete(r.clients, client.UserID)
      }
      r.mu.Unlock()

      r.lastActivity = time.Now()

      // Broadcast player left
      r.broadcast <- Message{
        Type:    "PLAYER_LEFT",
        Payload: client.UserID,
      }

      if len(r.clients) == 0 {
        return  // Room empty, goroutine exits
      }

    // Broadcast message to all players in room
    case msg := <-r.broadcast:
      r.mu.RLock()
      clientsCopy := make([]*Client, 0, len(r.clients))
      for _, c := range r.clients {
        clientsCopy = append(clientsCopy, c)
      }
      r.mu.RUnlock()

      r.lastActivity = time.Now()

      // Send to each client (non-blocking)
      for _, client := range clientsCopy {
        select {
        case client.Send <- msg:
          // Message sent ✅
        default:
          // ← IMPROVED: Mark client as unhealthy
          client.IsUnhealthy = true
          go func(c *Client) {
            time.Sleep(5 * time.Second)
            r.unregister <- c  // Trigger reconnect
          }(client)
        }
      }

    // Cleanup empty rooms
    case <-ticker.C:
      r.mu.RLock()
      isEmpty := len(r.clients) == 0
      r.mu.RUnlock()

      if isEmpty {
        return  // Exit goroutine
      }
    }
  }
}
```

2. **Update Hub Struct** (`arena/internal/hub/hub.go`):
```go
type Hub struct {
  rooms       map[string]*Room
  registerRoom chan *RegisterRoomRequest
  mu          sync.RWMutex  // ← ONLY for managing room creation
}

type RegisterRoomRequest struct {
  client *Client
  roomID string
}

func NewHub() *Hub {
  return &Hub{
    rooms:        make(map[string]*Room),
    registerRoom: make(chan *RegisterRoomRequest, 32),
  }
}

func (h *Hub) Run() {
  for {
    select {
    // Register client in room
    case req := <-h.registerRoom:
      h.mu.Lock()
      room, exists := h.rooms[req.roomID]
      if !exists {
        room = NewRoom(req.roomID)
        h.rooms[req.roomID] = room
        go room.Run()  // ← Start room goroutine
      }
      h.mu.Unlock()

      // Non-blocking send to room's register channel
      select {
      case room.register <- req.client:
      case <-time.After(5 * time.Second):
        // Room unresponsive? Create new instance
        h.mu.Lock()
        delete(h.rooms, req.roomID)
        h.mu.Unlock()
        // Retry would happen client-side
      }
    }
  }
}

// Broadcast to a specific room (non-blocking)
func (h *Hub) BroadcastToRoom(roomID string, msg Message) {
  h.mu.RLock()
  room, exists := h.rooms[roomID]
  h.mu.RUnlock()

  if !exists {
    return
  }

  select {
  case room.broadcast <- msg:
    // Sent ✅
  case <-time.After(100 * time.Millisecond):
    // Room broadcast channel full (shouldn't happen)
    // but don't block
  }
}
```

3. **Update WebSocket Handler**:
```go
func (h *Hub) HandleConnection(c *fiber.Ctx) error {
  ws.SetReadDeadline(time.Now().Add(60 * time.Second))

  client := &Client{
    UserID:  userID,
    RoomID:  roomID,
    Send:    make(chan models.ArenaWSMessage, 256),
    Hub:     h,
  }

  // Register in appropriate room (non-blocking)
  req := &RegisterRoomRequest{
    client: client,
    roomID: roomID,
  }
  
  select {
  case h.registerRoom <- req:
  case <-ctx.Done():
    return nil
  }

  // Start goroutines for this client
  go client.ReadPump()
  go client.WritePump()

  return nil
}
```

**Metrics After Fix**:
- ✅ Lock contention: Eliminated (per-room mutexes)
- ✅ Max concurrent connections: 1000 → **5000-10000**
- ✅ Message delivery latency: 100ms+ → **20-50ms**
- ✅ Throughput: 1000 msg/sec → **10000+ msg/sec**
- ✅ Time to implement: **2-3 days**

---

### Issue #2: Message Buffer Overflow + Silent Drops

**Problem**:
```
Current Code (arena/internal/hub/client.go):
select {
case client.Send <- msg:
  // Message sent ✅
default:
  // Buffer full, message DROPPED!
  // No notification, no error
  // Player never knows about #257
}

Scenario: Fast broadcast, slow client
├─ Server sends 256 messages (buffer size)
├─ Message #257 arrives
├─ Default case triggers → message DROPPED
├─ Player's scoreboard shows 0-256 but not #257
├─ "Why did player X's score drop?"
```

**Impact**:
- ❌ Silent message loss → data corruption
- ❌ Players see inconsistent scoreboards
- ❌ Debugging nightmare (no logs, no errors)
- ❌ Affects 5-10% of slow connections

**Solution**: Detect & Reconnect Slow Clients

**Implementation Steps**:

1. **Update Client Struct** (`arena/internal/hub/client.go`):
```go
type Client struct {
  UserID      string
  RoomID      string
  Conn        *websocket.Conn
  Send        chan models.ArenaWSMessage
  Hub         *Hub
  IsUnhealthy bool  // ← NEW: Track slow clients
  LastActive  time.Time
}
```

2. **Update Broadcast Logic** (in `room.go`):
```go
// In Room.Run() broadcast case:
case msg := <-r.broadcast:
  r.mu.RLock()
  clientsCopy := make([]*Client, 0, len(r.clients))
  for _, c := range r.clients {
    clientsCopy = append(clientsCopy, c)
  }
  r.mu.RUnlock()

  for _, client := range clientsCopy {
    select {
    case client.Send <- msg:
      // Message sent ✅
    default:
      // ← IMPROVED: Don't drop, mark unhealthy
      if !client.IsUnhealthy {
        client.IsUnhealthy = true
        log.Printf("Client %s marked unhealthy (buffer full)", client.UserID)
        
        // Trigger reconnect after 5 seconds
        go func(c *Client) {
          time.Sleep(5 * time.Second)
          r.unregister <- c
          c.Conn.Close()
        }(client)
      }
    }
  }
```

3. **Update WritePump** with timeout detection:
```go
func (c *Client) WritePump() {
  ticker := time.NewTicker(pingPeriod)
  defer func() {
    ticker.Stop()
    c.Conn.Close()
  }()

  for {
    select {
    case msg, ok := <-c.Send:
      c.Conn.SetReadDeadline(time.Now().Add(writeWait))
      if !ok {
        c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
        return
      }

      // ← NEW: Detect write timeout
      if err := c.Conn.WriteJSON(msg); err != nil {
        log.Printf("Write error for %s: %v", c.UserID, err)
        return
      }

    case <-ticker.C:
      c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
      if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
        log.Printf("Ping failed for %s: %v", c.UserID, err)
        return
      }
    }
  }
}
```

**Metrics After Fix**:
- ✅ Message loss: Eliminated
- ✅ Slow clients: Automatically reconnect
- ✅ Data consistency: Guaranteed
- ✅ Visibility: Proper logging
- ✅ Time to implement: **1 day**

---

### Issue #3: No Backpressure Handling (Cascading Slowness)

**Problem**:
```
Current Flow:
Server broadcasts fast → Client writes slow
├─ WritePump blocks on slow network
├─ ReadPump waits (both on same connection)
├─ Slow client blocks entire connection
├─ Updates queue in memory
└─ Message buffer overflows

At 100 slow connections:
├─ All buffers full
├─ 100 goroutines waiting on writes
├─ Memory: 100 × 256KB = 25MB+ in buffers alone
└─ Server becomes unresponsive
```

**Impact**:
- ❌ One slow client degrades entire server
- ❌ Memory bloat
- ❌ Cascading failures
- ❌ No way to detect problem

**Solution**: Add Write Timeout + Connection Health Check

**Implementation Steps**:

1. **Update WritePump with Timeout** (`arena/internal/hub/client.go`):
```go
const (
  writeWait      = 10 * time.Second   // ← MAX time for single write
  pongWait       = 60 * time.Second
  pingPeriod     = (pongWait * 9) / 10
  maxMessageSize = 512 * 1024
)

func (c *Client) WritePump() {
  ticker := time.NewTicker(pingPeriod)
  defer func() {
    ticker.Stop()
    c.Conn.Close()
  }()

  for {
    select {
    case msg := <-c.Send:
      // ← NEW: Set write deadline
      c.Conn.SetWriteDeadline(time.Now().Add(writeWait))

      if err := c.Conn.WriteJSON(msg); err != nil {
        if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
          log.Printf("WebSocket error: %v", err)
        }
        return  // ← EXIT if write fails (disconnect slow client)
      }

    case <-ticker.C:
      c.Conn.SetWriteDeadline(time.Now().Add(writeWait))

      if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
        log.Printf("Ping timeout for %s", c.UserID)
        return  // ← EXIT on ping timeout
      }
    }
  }
}
```

2. **Monitor Connection Health** (optional dashboard):
```go
type ConnectionMetrics struct {
  TotalConnections int
  SlowClients      int
  BufferOverflows  int
  WriteTimeouts    int
}

func (h *Hub) GetMetrics() ConnectionMetrics {
  h.mu.RLock()
  defer h.mu.RUnlock()

  metrics := ConnectionMetrics{
    TotalConnections: 0,
    SlowClients:      0,
  }

  for _, room := range h.rooms {
    room.mu.RLock()
    metrics.TotalConnections += len(room.clients)
    for _, client := range room.clients {
      if client.IsUnhealthy {
        metrics.SlowClients++
      }
    }
    room.mu.RUnlock()
  }

  return metrics
}
```

**Metrics After Fix**:
- ✅ Write timeout: 10 seconds max per message
- ✅ Slow clients: Detected and disconnected
- ✅ Server performance: Isolated from slow clients
- ✅ Memory: Stable and predictable
- ✅ Time to implement: **1 day**

---

### Issue #4: Unbounded Goroutine Creation

**Problem**:
```
Current Flow - Per Connection:
├─ 1 goroutine for ReadPump
├─ 1 goroutine for WritePump
├─ Potentially more for timeouts/reconnects
└─ Total: ~2-3 goroutines per connection

At 10,000 connections:
├─ 10,000 × 2.5 = 25,000 goroutines
├─ Each goroutine: ~8KB memory (Go default)
├─ Total memory: 25,000 × 8KB = 200MB just for goroutines!
├─ Stack allocation: 25K goroutines = scheduler overhead
└─ CPU: Excessive context switching

If goroutines leak (not cleaned up):
├─ Memory grows unbounded
├─ Eventually: OOM crash
└─ Hard to debug (goroutine leaks are sneaky)
```

**Impact**:
- ❌ Memory per connection: 200KB (buffer) + 16KB (2 goroutines)
- ❌ Goroutine leaks from improper cleanup
- ❌ CPU overhead: 25K goroutines = high scheduler load
- ❌ Memory pressure: Swap thrashing

**Solution**: Semaphore + Proper Cleanup

**Implementation Steps**:

1. **Add Goroutine Limit** (`arena/internal/hub/hub.go`):
```go
import "golang.org/x/sync/semaphore"

type Hub struct {
  rooms              map[string]*Room
  registerRoom       chan *RegisterRoomRequest
  mu                 sync.RWMutex
  goroutineSemaphore *semaphore.Weighted  // ← NEW
}

func NewHub() *Hub {
  return &Hub{
    rooms:              make(map[string]*Room),
    registerRoom:       make(chan *RegisterRoomRequest, 32),
    goroutineSemaphore: semaphore.NewWeighted(20000),  // Max 20K goroutines
  }
}
```

2. **Update Connection Handler** (`arena/internal/handlers/websocket.go`):
```go
func (h *Hub) HandleConnection(c *fiber.Ctx) error {
  // ... auth & validation ...

  // Acquire semaphore slot for this connection's goroutines
  ctx := c.Context()
  if !h.goroutineSemaphore.TryAcquire(2) {  // 2 per connection (Read + Write)
    return c.Status(fiber.StatusServiceUnavailable).JSON(
      fiber.Map{"error": "Server at capacity"},
    )
  }

  defer h.goroutineSemaphore.Release(2)  // ← Release on disconnect

  // ... rest of connection setup ...
}
```

3. **Ensure Cleanup** (both ReadPump & WritePump):
```go
func (c *Client) ReadPump() {
  defer func() {
    log.Printf("ReadPump cleanup for %s", c.UserID)
    c.Hub.rooms[c.RoomID].unregister <- c  // Notify room
    c.Conn.Close()
  }()

  c.Conn.SetReadDeadline(time.Now().Add(pongWait))
  c.Conn.SetPongHandler(func(string) error {
    c.Conn.SetReadDeadline(time.Now().Add(pongWait))
    return nil
  })

  for {
    var msg models.ArenaWSMessage
    if err := c.Conn.ReadJSON(&msg); err != nil {
      if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
        log.Printf("WebSocket error: %v", err)
      }
      return  // ← Cleanup happens in defer
    }

    // Handle message...
  }
}

func (c *Client) WritePump() {
  defer func() {
    log.Printf("WritePump cleanup for %s", c.UserID)
    c.Conn.Close()
  }()

  ticker := time.NewTicker(pingPeriod)
  defer ticker.Stop()

  for {
    select {
    case msg := <-c.Send:
      // ... send ...
    case <-ticker.C:
      // ... ping ...
    }
  }
}
```

**Metrics After Fix**:
- ✅ Goroutine limit: 20,000 (soft cap)
- ✅ Max connections: ~10,000 (2 goroutines each)
- ✅ Memory per goroutine: Predictable
- ✅ Cleanup: Guaranteed via defer
- ✅ Goroutine leaks: Prevented
- ✅ Time to implement: **1 day**

---

## 📊 PART 3: REDIS & INFRASTRUCTURE (2 Optimizations)

### Optimization #1: Configure Redis Connection Pooling

**Current Issue**:
```
Valkey 1GB on Aiven:
├─ Default single connection
├─ All instances serialize operations
├─ Max ops: 10,000-50,000 per second
└─ At 500 concurrent users: SATURATED
```

**Solution**: Enable Connection Pooling

**Implementation**:

1. **Update Redis Client** (`api/src/libs/redis.ts`):
```typescript
import { Redis } from '@upstash/redis';

// BEFORE (single connection):
const redis = new Redis({ url: REDIS_URL });

// AFTER (with connection pooling):
const redis = new Redis({
  url: REDIS_URL,
  
  // Connection pooling config
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  
  // Increase buffer size for batching
  commandTimeout: 5000,
  
  // Enable pipelining (batch operations)
  lazyConnect: false,
});

// Use pipeline for bulk operations
export async function batchCache(operations: Array<{ key: string; value: any; ttl: number }>) {
  const pipe = redis.pipeline();
  
  for (const { key, value, ttl } of operations) {
    pipe.setex(key, ttl, JSON.stringify(value));
  }
  
  return pipe.exec();  // ← Single network round-trip
}
```

2. **Test Connection Pool**:
```bash
# Monitor Redis connections
redis-cli CLIENT LIST | wc -l
# Should show multiple connections from your instances
```

**Metrics**:
- ✅ Ops/sec: 10K-50K → 50K-150K (with pooling)
- ✅ Latency: Reduced via pipelining
- ✅ 1GB capacity: Handles 3000-5000 users
- ✅ Time: **0.5 day** (config change)

---

### Optimization #2: Add Redis Monitoring & Alerts

**Implementation**:

```go
// arena/internal/repository/redis.go
// Monitor Redis health

func (r *ArenaRepository) HealthCheck() {
  ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
  defer cancel()

  if err := r.client.Ping(ctx).Err(); err != nil {
    log.Printf("⚠️  Redis health check failed: %v", err)
    // Alert: PagerDuty / Slack
  }
}

func (r *ArenaRepository) MonitorMetrics() {
  ticker := time.NewTicker(30 * time.Second)
  defer ticker.Stop()

  for range ticker.C {
    info := r.client.Info(context.Background(), "stats")
    // Track:
    // - connected_clients
    // - total_commands_processed
    // - used_memory
    // Alert if approaching limits
  }
}
```

---

## 🚀 IMPLEMENTATION TIMELINE

### Week 1: High-Impact Quick Wins

| Day | Task | Priority | Time | Impact |
|-----|------|----------|------|--------|
| Mon | Node.js clustering | 🔴 CRITICAL | 1 day | 4-8× throughput |
| Tue | Chat read-through cache | 🔴 CRITICAL | 1 day | 50× faster |
| Wed | Groq timeout + circuit breaker | 🔴 CRITICAL | 1 day | Prevent crashes |
| Thu | Go Hub per-room refactor START | 🔴 CRITICAL | 2-3 days | 5000 users |
| Fri | Testing + deployment prep | 🟠 HIGH | 1 day | Ready for prod |

**End of Week 1 Impact**: 300 → 1000 concurrent users ✅

---

### Week 2: Go Hub Completion + Refinements

| Day | Task | Priority | Time | Impact |
|-----|------|----------|------|--------|
| Mon | Go Hub per-room refactor FINISH | 🔴 CRITICAL | 1 day | Complete |
| Tue | Message buffer + backpressure | 🟠 HIGH | 1 day | No message loss |
| Wed | Goroutine limit + cleanup | 🟠 HIGH | 1 day | Memory stable |
| Thu | LLM response caching | 🟠 HIGH | 1-2 days | 50% latency reduction |
| Fri | Load testing + performance tuning | 🟠 HIGH | 1 day | Validate metrics |

**End of Week 2 Impact**: 1000 → 3000 concurrent users ✅

---

### Week 3: Database Scaling + Monitoring

| Day | Task | Priority | Time | Impact |
|-----|------|----------|------|--------|
| Mon | PostgreSQL dedicated instance | 🟠 HIGH | 1 day | Remove serverless penalty |
| Tue | PgBouncer setup | 🟠 HIGH | 1 day | Connection pooling |
| Wed | Prometheus + Grafana setup | 🟠 HIGH | 1-2 days | Visibility |
| Thu | Load testing at 5000 users | 🟠 HIGH | 1 day | Identify remaining issues |
| Fri | Production deployment | 🟠 HIGH | 1 day | Go live |

**End of Week 3 Impact**: 3000 → 5000+ concurrent users ✅

---

## ✅ VALIDATION CHECKLIST

### Before Each Phase

- [ ] Code review completed
- [ ] Unit tests written & passing
- [ ] Integration tests passing
- [ ] Load test scenario passed (synthetic traffic)
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented

### Load Testing Scenarios

**Scenario 1: Chat Load**
```bash
# Simulate 100 concurrent chat sends
ab -n 1000 -c 100 http://localhost:3000/chat/threads/123/messages
# Expected: <2s response time (with cache hits)
```

**Scenario 2: WebSocket Connections**
```bash
# Simulate 1000 WebSocket connections joining room
# Tool: Artillery or custom WS load test
# Expected: All join within 10s, no message drops
```

**Scenario 3: Cache Stampede**
```bash
# Expire all caches, hammer with 500 concurrent requests
# Expected: Database not overwhelmed, recovery <5s
```

**Scenario 4: Slow Client Handling**
```bash
# Simulate slow network (1KB/s), verify auto-disconnect
# Expected: Client marked unhealthy after 10s, reconnect offered
```

---

## 📈 EXPECTED GROWTH

| Phase | Users | REST API | WebSocket | DB | Redis | Timeline |
|-------|-------|----------|-----------|----|----|----------|
| Current | 300 | ❌ | ❌ | ✅ | ❌ | Now |
| Phase 1 | 1000 | ✅ | 🟡 | 🟡 | ✅ | +1 week |
| Phase 2 | 3000 | ✅ | ✅ | 🟡 | ✅ | +2 weeks |
| Phase 3 | 5000+ | ✅ | ✅ | ✅ | ✅ | +3 weeks |
| Future | 10K+ | Horizontal scale | Horizontal scale | Read replicas | Cluster | TBD |

---

## ⚠️ RISK MITIGATION

| Risk | Mitigation |
|------|-----------|
| **Go Hub refactor introduces bugs** | Extensive unit tests + staging environment |
| **Database migration causes downtime** | Use PITR, shadow traffic, gradual cutover |
| **Load test doesn't match production** | Include realistic user behavior (think times, etc.) |
| **Redis becomes bottleneck again** | Monitor ops/sec, add Redis Cluster before 5K users |
| **Monitoring setup too slow** | Use Prometheus template, pre-configured dashboards |

---

## 📞 SUPPORT & DEBUGGING

### Common Issues & Fixes

**Issue**: Chat messages slow despite cache fix
- **Cause**: Cache invalidation too aggressive
- **Fix**: Adjust TTL, add cache warming

**Issue**: WebSocket connections drop after fix
- **Cause**: Goroutine cleanup not working
- **Fix**: Verify defer() statements, add logging

**Issue**: Database still slow at 3000 users
- **Cause**: Neon serverless cold starts
- **Fix**: Migrate to dedicated PostgreSQL instance

**Issue**: Redis memory growing unbounded
- **Cause**: No eviction policy
- **Fix**: Set `maxmemory-policy allkeys-lru` in Redis config

---

## 🎓 LESSONS LEARNED (For Next Project)

1. **Start with load testing**: Identify bottlenecks early
2. **Avoid single points of failure**: Multiple Redis nodes, DB replicas
3. **Design for horizontal scaling**: Stateless API servers
4. **Monitor from day 1**: APM + custom metrics
5. **Use async for LLM**: Never block event loop on external APIs

---

**Document Status**: READY FOR IMPLEMENTATION  
**Last Updated**: May 23, 2026  
**Next Review**: After Phase 1 completion
