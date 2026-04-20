import { merge, omit, isObject } from "lodash-es";

/**
 * Standard fields to omit from all API responses to prevent data leaks.
 */
const FORBIDDEN_FIELDS = ["__v", "password", "clerkId"];

export interface PaginationMeta {
  totalItems: number
  itemCount: number
  perPage: number
  totalPages: number
  currentPage: number
}

export interface ApiErrorPayload {
  code: string
  message: string
  details?: unknown
}

export interface ApiResponsePayload<T> {
  success: boolean
  data?: T
  error?: ApiErrorPayload
  meta?: PaginationMeta | Record<string, unknown>
}

export class ApiResponse<T = unknown> {
  private payload: ApiResponsePayload<T>

  private constructor(payload: ApiResponsePayload<T>) {
    this.payload = payload
  }

  static success<T>(
    data: T,
    meta?: PaginationMeta | Record<string, unknown>,
  ): ApiResponse<T> {
    return new ApiResponse<T>({
      success: true,
      data,
      meta,
    })
  }

  static paginated<T>(
    data: T,
    pagination: PaginationMeta,
    extraMeta?: Record<string, unknown>,
  ): ApiResponse<T> {
    return new ApiResponse<T>({
      success: true,
      data,
      meta: merge({}, pagination, extraMeta),
    })
  }

  static failure(
    code: string,
    message: string,
    details?: unknown,
  ): ApiResponse<null> {
    return new ApiResponse<null>({
      success: false,
      error: {
        code,
        message,
        details,
      },
    })
  }

  private static sanitize<T>(data: T): T {
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item)) as unknown as T;
    }
    if (isObject(data)) {
      return omit(data as object, FORBIDDEN_FIELDS) as unknown as T;
    }
    return data;
  }

  toJSON(): ApiResponsePayload<T> {
    const payload = { ...this.payload };
    if (payload.data !== undefined) {
      payload.data = ApiResponse.sanitize(payload.data);
    }
    return payload;
  }
}

