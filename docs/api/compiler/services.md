# Compiler Services

The `CompilerService` manages the integration with the `WandboxService` (the actual HTTP client). Its main responsibilities are standardizing error/output formats and implementing an inline cache for static data.

**File**: [api/src/services/compiler/compiler.service.ts](../../../api/src/services/compiler/compiler.service.ts)

## 1. Inline Caching (`getLanguages`)
Wandbox supports dozens of languages and compiler versions. Fetching this list requires a heavy HTTP request, but the data almost never changes.
To optimize this, `CompilerService` implements an **inline Redis cache** directly inside the `getLanguages` method (avoiding the need for a separate Decorator file).

1. Checks `redis.get("compiler:languages")`.
2. If it misses, calls `wandboxService.getCompilers()`.
3. Caches the result using `EX 86400` (a full 24-hour TTL).
4. Includes a safe fallback: if Redis is down or throws an error, it swallows the error and just returns the direct Wandbox response anyway.

## 2. Standardization (`execute`)
The raw Wandbox API is very loose with its response payload. Depending on how a program crashes, the error message might be in `program_error`, `compiler_error`, or even `compiler_message`. 

The `execute` method takes the raw result from `wandboxService.compile()` and normalizes it into a strict `CompilerExecutionResponse` interface:

```typescript
{
  output: result.program_output || result.compiler_message || "",
  error: result.program_error || result.compiler_error || undefined,
  exitCode: parseInt(result.status || "0"),
  url: result.url,
}
```

This guarantees the frontend always receives the exact same predictable object structure, regardless of which language was compiled or how it failed.
