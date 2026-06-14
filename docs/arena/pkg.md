# Arena `pkg` Layer

**File Location**: [arena/pkg/](../../../arena/pkg/)

## Responsibilities

Contains cross-cutting, globally shared infrastructure logic.

- **`config`**: Uses `godotenv` to safely parse the local `.env` file or accept injected OS-level environment variables (for Docker/Kubernetes deployments).
- **`redis`**: Instantiates the standard `github.com/redis/go-redis` client connection pool used by the `repository` and `hub` layers.
