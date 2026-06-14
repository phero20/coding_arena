# Judge Cache Layer

The Judge Cache provides a cost-saving and performance-enhancing layer specifically for AI-based evaluations.

**File Location**: [api/src/cache/judge/ai-judge.cache.ts](../../../api/src/cache/judge/ai-judge.cache.ts)

## `AiJudgeCache`

While standard languages (Python, C++) are run safely in the Judge0 sandbox, obscure or highly specific languages might rely on the `AiCodeJudgeService` to determine correctness. Because calling the LLM is expensive and relatively slow, we wrap it in a strict cache using the Decorator Pattern.

### Caching Strategy

The cache must guarantee that if a user submits the exact same code against the exact same test cases, the system does not hit the LLM API again.

1. **Deterministic Hashing**:
   - `sourceHash`: Calculates an SHA-256 hash of the exact `input.sourceCode`.
   - `testsHash`: Calculates an SHA-256 hash of the stringified test cases.

2. **The Key**:
   - `ai-cache:{problemId}:{languageId}:{sourceHash}:{testsHash}`

3. **Execution Flow**:
   - Tries to fetch the key from Redis.
   - If found (**Cache Hit**), it returns the exact `ACCEPTED` or `WRONG_ANSWER` JSON payload instantly, appending a `{ cached: true }` flag.
   - If missing (**Cache Miss**), it calls the heavy `rawAiCodeJudgeService.runSamples()`.
   - Caches the AI's verdict for 86,400 seconds (24 hours). If another user (or the same user) submits that exact code later that day, it resolves instantly for free!
