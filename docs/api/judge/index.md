# Judge & Worker Module Overview

The **Judge & Worker Module** is the most complex execution engine within the `coding_arena` backend. It is responsible for asynchronously evaluating untrusted user code against hidden test cases, ensuring security, catching false positives/negatives via AI, and propagating the results throughout the system.

## Execution Architecture

Because executing code against hundreds of test cases can take several seconds, this process is detached from the main HTTP thread using **BullMQ**.

1. **Submission**: A user submits code via the `/submissions` REST endpoint.
2. **Queue**: The payload is pushed to the `evaluations` BullMQ queue.
3. **Worker**: The background worker picks up the job.
4. **Execution Service**: The code is packaged with the problem signature and test cases, then sent to a sandbox (Judge0).
5. **Suspicion & Audit**: The results are parsed. If the driver detects suspicious behavior (e.g., printing expected output without computing it), an AI Agent audits the code and can override the Judge0 verdict.
6. **Propagation**: The worker records the execution time, updates the Database, updates user Statistics, and forwards the results to the Arena if it was part of a live match.

## Directory Structure

```text
api/src/
├── workers/submission/
│   ├── processor.ts                       # BullMQ Job Handler
│   └── evaluator.ts                       # Test Case Aggregator
├── services/judge/
│   ├── driver-judge-execution.service.ts  # Orchestration & Suspicion Engine
│   ├── ai-verdict-audit.service.ts        # AI Override Engine
│   ├── judge0.service.ts                  # Sandbox Integration
│   └── wandbox.service.ts                 # Public Proxy Sandbox
└── cache/judge/
    └── ai-judge.cache.ts                  # AI Fallback Memory
```

## Documentation Layers

To explore the exact implementation details, please see the specific layer documentation:

- [Worker](./worker.md): Background Job Processing (BullMQ)
- [Services](./services.md): Orchestration, Suspicion, and AI Auditing
- [API Clients](./api-clients.md): External Sandbox Integrations
- [Cache](./cache.md): AI Judge Fallback Caching
