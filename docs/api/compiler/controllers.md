# Compiler Controller

The `CompilerController` acts as a pass-through layer, pulling the Zod-validated payloads from Hono and routing them to the `CompilerService`.

**File**: [api/src/controllers/compiler/compiler.controller.ts](../../../api/src/controllers/compiler/compiler.controller.ts)

## `CompilerController`

Because the underlying `CompilerService` returns properly formatted response objects, the controller does not need to wrap the responses in `ApiResponse.success()`. It simply returns the data exactly as the service provides it.

### Actions:

1. **`getLanguages`**
   - **Validation**: None.
   - **Action**: Delegates to `compilerService.getLanguages()` to fetch the cached array of supported compilers.

2. **`execute`**
   - **Validation**: Extracts the Zod-validated `ExecuteCodeInput` from `req.body`.
   - **Action**: Delegates the execution request to `compilerService.execute(req.body)`.
