import { createLogger } from "./utils/logger";

const logger = createLogger("circuit-breaker");

export enum CircuitState {
  CLOSED = "CLOSED",      // Normal operation
  OPEN = "OPEN",          // Failing, reject requests immediately
  HALF_OPEN = "HALF_OPEN" // Testing recovery with a single request
}

export class CircuitBreaker {
  public state: CircuitState = CircuitState.CLOSED;
  public failureCount = 0;
  public successCount = 0;
  public lastFailureTime?: number;
  
  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly name: string;

  constructor(
    name: string,
    failureThreshold = 3,
    successThreshold = 1,
    resetTimeoutMs = 60000 // 60 seconds
  ) {
    this.name = name;
    this.failureThreshold = failureThreshold;
    this.successThreshold = successThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      const timeSinceFailure = Date.now() - (this.lastFailureTime || 0);
      
      if (timeSinceFailure > this.resetTimeoutMs) {
        logger.info(`[${this.name}] Circuit HALF_OPEN: Testing recovery.`);
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new Error(`CircuitBreaker[${this.name}] is OPEN. Fast-failing request.`);
      }
    }

    try {
      // Execute the actual function
      const result = await fn();

      this.onSuccess();
      return result;
    } catch (err: any) {
      this.onFailure(err);
      throw err;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        logger.info(`✅ [${this.name}] Circuit CLOSED. Resuming normal operation.`);
        this.state = CircuitState.CLOSED;
      }
    }
  }

  private onFailure(err: any) {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN || this.failureCount >= this.failureThreshold) {
      if (this.state !== CircuitState.OPEN) {
        logger.error({ err: err.message }, `❌ [${this.name}] Circuit OPENED! Rejecting requests for ${this.resetTimeoutMs / 1000}s.`);
      }
      this.state = CircuitState.OPEN;
    }
  }
}
