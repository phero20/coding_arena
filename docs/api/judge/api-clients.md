# API Clients

The Judge module communicates with external execution sandboxes using dedicated HTTP clients.

**File Location**: [api/src/services/judge/](../../../api/src/services/judge/)

## 1. `judge0.service.ts`

The integration client for the self-hosted or cloud-hosted **Judge0 CE** (Community Edition) sandbox. This is the primary execution engine for all standard coding problems (Python, C++, Java, JS, TS).

### Responsibilities:
- **Batch Submission**: Sends payloads to `/submissions/batch?base64_encoded=true` to maximize throughput. It ensures all source code and inputs are properly Base64 encoded to prevent shell injection or escaping errors inside the container.
- **Polling**: Exposes `getBatchResults()` which the orchestrator loops over until the submission reaches a terminal state (anything other than `1` In Queue or `2` Processing).
- **Timeouts**: Uses an `AbortController` to strictly enforce a 15-second network timeout on API calls to prevent the background worker from hanging infinitely if the Judge0 server dies.

---

## 2. `wandbox.service.ts`

The integration client for the public **Wandbox API**. This service powers the lightweight public Compiler / Playground, allowing users to execute one-off code snippets without touching the heavy Judge0 infrastructure.

### Responsibilities:
- **`getCompilers`**: Hits `/list.json` to get the master list of all compilers (gcc, clang, node, etc.) supported by Wandbox.
- **`compile`**: Posts the user payload to `/compile.json` and returns the raw unstructured output object, which the `CompilerService` later standardizes.
