import type { Context } from "hono";
import { AppError } from "../../utils/app-error";
import { ApiResponse } from "../../utils/api-response";
import { type ICradle } from "../../libs/awilix-container";
import { type ILogger } from "../../libs/utils/logger";

/**
 * Global Error Handler Middleware.
 * Standardizes all application errors into a consistent API response format.
 */
export class ErrorMiddleware {
  private readonly logger: ILogger;

  constructor({ logger }: ICradle) {
    this.logger = logger;
  }

  /**
   * Handles global application errors.
   * Logic previously inlined in app.ts is now encapsulated here.
   */
  handle(err: Error, c: Context) {
    let appError: AppError;

    if (err instanceof AppError) {
      appError = err;
    } else if (err instanceof Error) {
      appError = AppError.internal(err.message, undefined, err);
    } else {
      appError = AppError.internal("Unexpected error", err, undefined);
    }

    // Structured logging with context (Trace ID, Error Code)
    const traceId = c.get("requestId");
    this.logger.error(
      {
        code: appError.code,
        cause: appError.cause,
        traceId,
      },
      appError.message,
    );

    const response = ApiResponse.failure(
      appError.code,
      appError.message,
      appError.details,
    );

    return c.json(response.toJSON(), appError.statusCode as any);
  }
}
