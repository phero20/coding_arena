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
      meta: {
        ...pagination,
        ...extraMeta,
      },
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

  toJSON(): ApiResponsePayload<T> {
    return this.payload
  }
}

