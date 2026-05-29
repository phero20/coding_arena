# API Reference: System

The System API provides health monitoring and diagnostic endpoints for the platform.

## 💓 Monitoring

### `GET /health`
Returns the operational status of the API and its critical dependencies.
*   **Auth Required**: No
*   **Response**: `200 OK` (Healthy) or `503 Service Unavailable` (Unhealthy).
    ```json
    {
      "status": "HEALTHY | UNHEALTHY",
      "checks": {
        "mongodb": "UP | DOWN",
        "redis": "UP | DOWN"
      },
      "timestamp": "ISO8601"
    }
    ```
