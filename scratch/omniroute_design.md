# OmniRoute: Go-Based High-Performance Distributed LLM Router & Key Load Balancer

OmniRoute is a production-grade, highly optimized routing and key-rotation engine designed to maximize throughput across hundreds of free and paid API keys (such as Gemini, Groq, and OpenRouter) while handling millions of concurrent requests. It is implemented in **Go (Golang)**.

OmniRoute operates in **two modes**:
1. **As a Go Package (Library Mode):** Imported directly into Go codebases, initialized with keys and an optional Redis instance.
2. **As a Standalone Daemon (Service Mode):** A containerized Go microservice exposing an HTTP/gRPC reverse proxy mimicking the OpenAI and Gemini API endpoints.

---

## 1. Core Architecture Modes

### A. Go Library Mode (In-Process)
The package is initialized directly within your application:
```go
// Example logical initialization
router := omniroute.New({
    Keys: []string{"gemini_key1", "groq_key2", ...},
    RedisURL: "redis://localhost:6379", // Optional
    RoutingOptions: omniroute.DefaultOptions(),
})
```

### B. Microservice Mode (Reverse Proxy Daemon)
* Runs as a standalone Go binary inside Docker.
* Loads keys from environment variables or a configuration file.
* Listens on a port and routes requests through the gateway. Other microservices change their LLM client Base URLs to point to OmniRoute, rendering key-rotation and rate-limiting completely transparent to client apps.

### C. Key Auto-Detection & Input Format
OmniRoute accepts keys either as a **raw string** (auto-detected via standard prefixes) or as a **metadata object** (useful for custom endpoints, proxies, or private endpoints).

1. **Auto-Detection (Prefix Matching)**:
   * **Gemini**: Keys starting with `AIzaSy`
   * **Groq**: Keys starting with `gsk_`
   * **OpenRouter**: Keys starting with `sk-or-v1-`
   * **Anthropic (Claude)**: Keys starting with `sk-ant-`
   * **OpenAI**: Keys starting with `sk-proj-` or `sk-` (excluding Anthropic & OpenRouter patterns)

2. **Explicit Object Mode**:
   For custom proxy strings, private local deployments, or self-hosted models, developers can explicitly define the key provider using a configuration object:
   ```json
   {
     "key": "my-custom-proxy-string-123",
     "provider": "gemini"
   }
   ```

---

## 2. The Core Algorithm: Dynamic Cost-Aware Priority Queue Scheduler (DC-PQS)

To route millions of requests instantly without checking keys sequentially or causing race conditions, OmniRoute partitions keys into **Min-Heaps** based on their provider.

### A. Key Representation State
Each API key is tracked as a node with the following attributes:
* `KeyID` (String)
* `Provider` (Gemini | Groq | OpenRouter | etc.)
* `ModelScope` (List of supported models)
* `TokensAvailable` (Integer, representing current rate limit capacity)
* `ReadyTimestamp` (UNIX epoch milliseconds - when the key will have at least one token available)
* `CostWeight` (Float: `0` for free keys, `>0` for paid/metered keys)

### B. Multi-Heap Partitioning
Instead of a single large key pool, keys are grouped into separate Min-Heaps:
* `geminiHeap`
* `groqHeap`
* `openrouterHeap`

The priority of nodes in each heap is determined by `ReadyTimestamp` (lowest timestamp = highest priority).

### C. Request Matching & Key Allocation Logic
When a request arrives targeting a specific provider strategy (e.g. `groq`):
1. **Check Strategy:**
   * If a specific provider is forced (e.g., `groq`), look only at `groqHeap`.
   * If `mix` is selected (default), evaluate the top element of **all** heaps and select the key with the lowest `ReadyTimestamp` and lowest `CostWeight`.
2. **Evaluate Availability:**
   * If `ReadyTimestamp <= CurrentTime`, the key is immediately popped. Its `TokensAvailable` is decremented, its next `ReadyTimestamp` is calculated based on its rate limits (RPM/TPM), and it is pushed back into the heap ($O(\log N)$ operation).
   * If `ReadyTimestamp > CurrentTime`, the scheduler pauses execution for the delta (`ReadyTimestamp - CurrentTime`) via Go channels/timers before retrying.

---

## 3. Concurrency & Collision Avoidance

To prevent multiple concurrent Go routines from picking the same API key token at the exact same microsecond, OmniRoute uses two concurrency models:

### A. Local Mode (In-Memory) — Go Channels and Mutexes
* Utilizes Go's native synchronization primitives (`sync.Mutex` or `sync.RWMutex`) around heap modifications.
* Allocations are CPU-bound and run sequentially inside a Go channel scheduler loop.
* Because the check and update loop is synchronous and extremely fast, race conditions are mathematically eliminated.

### B. Distributed Mode (Multi-Instance) — Redis Lua Scripting
If running multiple server instances of OmniRoute sharing a single Redis state store:
* Key selection is written as a **Redis Lua Script**.
* When a worker requests a key, it invokes the Lua script.
* Since Redis executes Lua scripts in a single-threaded transaction, the check, token decrement, and ready-timestamp update are fully **atomic** across all server instances.

---

## 4. Backpressure & Fair-Share Queueing

### A. Fair-Share Queueing (Deficit Round Robin)
To prevent a single user or script from spamming 10,000 concurrent requests and starving all other users:
* Incoming requests are grouped into separate sub-queues based on a `ClientID` or `UserID`.
* The scheduler processes these sub-queues using a **Deficit Round Robin (DRR)** algorithm.
* This ensures that if User A runs a batch job of 1,000 queries and User B runs 1 query, User B's query is routed immediately without waiting behind User A.

### B. Asynchronous Backpressure
* If the Min-Heaps indicate that no keys have available tokens, requests are held in a pending queue.
* Once a key's `ReadyTimestamp` is reached, the scheduler yields a token and triggers the next queue execution.
* Clients do not receive `429` errors; instead, they experience minor latency delays while their requests wait in a queue, guaranteeing eventual execution.

---

## 5. Telemetry & Self-Healing Feedback Loop

If a dispatched request fails at the API level, the scheduler intercepts the response:
* **`503 Service Unavailable` (Transient Overload):**
  * Update key: `ReadyTimestamp = CurrentTime + 1 Minute`.
  * Return the failed job to the front of the queue to be retried instantly with another key.
* **`429 Too Many Requests` (Daily Limit Reached):**
  * Update key: `ReadyTimestamp = CurrentTime + 24 Hours`.
  * Return job to queue.
* **`403 Forbidden` (Banned/Revoked Key):**
  * Permanently remove the key from the Min-Heap registry.
  * Return job to queue.
* **`200 OK` (Success):**
  * Recalculate token bucket replenishment and return key to normal rotation.

---

## 6. Provider Routing Strategies

* **Mix (Default):** Evaluates all available heaps and selects the best key regardless of provider.
* **Strict Provider (e.g. Gemini Only):** Rejects the query with a `429` if all Gemini keys are exhausted.
* **Graceful Fallback:** Tries the requested provider first, but seamlessly falls back to alternative pools (e.g., Groq) if the primary provider's keys are completely offline or locked in cooldown.
