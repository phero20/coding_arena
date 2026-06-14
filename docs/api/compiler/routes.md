# Compiler Routes

The Compiler routes provide public endpoints for fetching supported languages and executing arbitrary code.

**File Location**: [api/src/routes/compiler.routes.ts](../../../api/src/routes/compiler.routes.ts)

## Dependencies Injected

The route registration function `registerCompilerRoutes` expects:
- `compilerController`: Handles the HTTP logic.
- `rateLimitMiddleware`: Secures the execution endpoint.

---

## API Endpoints

### 1. Get Languages
- **Method**: `GET`
- **Path**: `/api/v1/compiler/languages`
- **Auth Required**: No (`requireAuth: false`)
- **Controller Action**: `compilerController.getLanguages`
- **Description**: Fetches the list of all available languages and compiler versions supported by Wandbox. 

### 2. Execute Code
- **Method**: `POST`
- **Path**: `/api/v1/compiler/execute`
- **Auth Required**: No (`requireAuth: false`)
- **Middleware**: **`rateLimitMiddleware`**
- **Validation**: Zod `ExecuteCodeSchema` (ensures `compiler` string and `code` string are provided).
- **Controller Action**: `compilerController.execute`
- **Description**: The core execution proxy. Accepts raw source code and standard input (`stdin`), and returns the standard output (`stdout`) or standard error (`stderr`).

## Security: Rate Limiting
Because the `/execute` route is public and makes requests to an external API (Wandbox), it is highly vulnerable to abuse or infinite loop spam. 
To protect the backend, a strict rate limit is applied directly to the route:
- **Window**: 60,000 ms (1 minute).
- **Max**: 5 requests per IP address.
- **Key Prefix**: `"rl:compiler"`
