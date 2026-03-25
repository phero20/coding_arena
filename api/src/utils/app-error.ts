export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'TOO_MANY_REQUESTS'

export interface AppErrorOptions {
  statusCode?: number
  code?: ErrorCode
  details?: unknown
  cause?: unknown
  isOperational?: boolean
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;
  public readonly isOperational: boolean;
  public override readonly cause?: unknown;

  constructor(message: string, options: AppErrorOptions = {}) {
    const { statusCode, code, details, cause, isOperational = true } = options;
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode ?? 500;
    this.code = code ?? "INTERNAL_ERROR";
    this.details = details;
    this.cause = cause;
    this.isOperational = isOperational;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  static badRequest(message = "Bad request", details?: unknown) {
    return new AppError(message, {
      statusCode: 400,
      code: "BAD_REQUEST",
      details,
    });
  }

  static tooManyRequests(message = "Too many requests", details?: unknown) {
    return new AppError(message, {
      statusCode: 429,
      code: "TOO_MANY_REQUESTS",
      details,
    });
  }

  static unauthorized(message = "Unauthorized", details?: unknown) {
    return new AppError(message, {
      statusCode: 401,
      code: "UNAUTHORIZED",
      details,
    });
  }

  static forbidden(message = "Forbidden", details?: unknown) {
    return new AppError(message, {
      statusCode: 403,
      code: "FORBIDDEN",
      details,
    });
  }

  static notFound(message = "Resource not found", details?: unknown) {
    return new AppError(message, {
      statusCode: 404,
      code: "NOT_FOUND",
      details,
    });
  }

  static conflict(message = "Conflict", details?: unknown) {
    return new AppError(message, {
      statusCode: 409,
      code: "CONFLICT",
      details,
    });
  }

  static unprocessableEntity(
    message = "Unprocessable entity",
    details?: unknown,
  ) {
    return new AppError(message, {
      statusCode: 422,
      code: "UNPROCESSABLE_ENTITY",
      details,
    });
  }

  static internal(
    message = "Internal server error",
    details?: unknown,
    cause?: unknown,
  ) {
    return new AppError(message, {
      statusCode: 500,
      code: "INTERNAL_ERROR",
      details,
      cause,
      isOperational: false,
    });
  }

  static serviceUnavailable(
    message = "Service unavailable",
    details?: unknown,
  ) {
    return new AppError(message, {
      statusCode: 503,
      code: "SERVICE_UNAVAILABLE",
      details,
    });
  }
}

