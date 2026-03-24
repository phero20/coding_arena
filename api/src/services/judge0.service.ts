import { config } from '../configs/env'

export interface Judge0SubmissionPayload {
  source_code: string
  language_id: number | string
  stdin?: string
  expected_output?: string
  cpu_time_limit?: number
  memory_limit?: number
  base64_encoded?: boolean
}

export interface Judge0SubmissionToken {
  token: string
}

export interface Judge0CreateBatchResponse {
  submissions: Judge0SubmissionToken[]
}

export interface Judge0Status {
  id: number
  description: string
}

export interface Judge0SubmissionResult {
  token: string
  status: Judge0Status
  stdout?: string | null
  stderr?: string | null
  compile_output?: string | null
  message?: string | null
  time?: string | null
  memory?: number | null
}

export class Judge0Service {
  private readonly baseUrl = config.judge0BaseUrl

  private ensureConfigured() {
    if (!this.baseUrl) {
      throw new Error('Judge0 configuration is missing. Ensure JUDGE0_BASE_URL is set.')
    }
  }

  private async request<T>(
    path: string,
    init: RequestInit,
  ): Promise<T> {
    this.ensureConfigured()

    const url = `${this.baseUrl}${path}`
    const headers: HeadersInit = {
      'content-type': 'application/json',
      ...(init.headers || {}),
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    try {
      const response = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      })

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(
          `Judge0 request failed with status ${response.status}: ${text}`,
        )
      }

      return (await response.json()) as T
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Judge0 request timed out')
      }
      throw error
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Creates a batch of submissions in Judge0 and returns their tokens.
   *
   * This method is a thin wrapper over POST /submissions/batch.
   */
  async createBatchSubmissions(
    submissions: Judge0SubmissionPayload[],
  ): Promise<Judge0SubmissionToken[]> {
    const body = JSON.stringify({
      submissions,
    })

    const result = await this.request<Judge0CreateBatchResponse | Judge0SubmissionToken[]>(
      '/submissions/batch',
      {
        method: 'POST',
        body,
      },
    )

    // Judge0 can return either an array of tokens or an object with a
    // "submissions" array depending on version/config.
    if (Array.isArray(result)) {
      return result as Judge0SubmissionToken[]
    }

    if (Array.isArray((result as Judge0CreateBatchResponse).submissions)) {
      return (result as Judge0CreateBatchResponse).submissions
    }

    throw new Error('Unexpected Judge0 batch create response format')
  }

  /**
   * Fetches the results for a batch of submission tokens.
   *
   * This is a thin wrapper over GET /submissions/batch?tokens=...
   */
  async getBatchResults(
    tokens: string[],
  ): Promise<Judge0SubmissionResult[]> {
    if (tokens.length === 0) return []

    const params = new URLSearchParams({
      tokens: tokens.join(','),
      // We are currently sending plain (non-base64) payloads.
      base64_encoded: 'false',
      // Ask Judge0 to include detailed fields so we can surface
      // compilation/runtime errors in our API response.
      fields:
        'stdout,stderr,compile_output,message,status,time,memory',
    })

    const result = await this.request<
      { submissions: Judge0SubmissionResult[] } | Judge0SubmissionResult[]
    >(`/submissions/batch?${params.toString()}`, {
      method: 'GET',
    })

    if (Array.isArray(result)) {
      return result as Judge0SubmissionResult[]
    }

    if (Array.isArray((result as { submissions: Judge0SubmissionResult[] }).submissions)) {
      return (result as { submissions: Judge0SubmissionResult[] }).submissions
    }

    throw new Error('Unexpected Judge0 batch results response format')
  }
}

