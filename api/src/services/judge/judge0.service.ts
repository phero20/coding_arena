import { config } from "../../configs/env";

export interface Judge0SubmissionPayload {
  source_code: string;
  language_id: number | string;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
  base64_encoded?: boolean;
  compiler_options?: string;
}

export interface Judge0SubmissionToken {
  token: string;
}

export interface Judge0CreateBatchResponse {
  submissions: Judge0SubmissionToken[];
}

export interface Judge0Status {
  id: number;
  description: string;
}

export interface Judge0SubmissionResult {
  token: string;
  status: Judge0Status;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | null;
  memory?: number | null;
}

import { type ICradle } from "../../libs/awilix-container";

export class Judge0Service {
  constructor(_: ICradle) {}
  private readonly baseUrl = config.judge0BaseUrl;

  private ensureConfigured() {
    if (!this.baseUrl) {
      throw new Error(
        "Judge0 configuration is missing. Ensure JUDGE0_BASE_URL is set.",
      );
    }
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    this.ensureConfigured();

    const url = `${this.baseUrl}${path}`;
    const headers: HeadersInit = {
      "content-type": "application/json",
      ...(init.headers || {}),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          `Judge0 request failed with status ${response.status}: ${text}`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Judge0 request timed out");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Creates a batch of submissions in Judge0 and returns their tokens.
   */
  async createBatchSubmissions(
    submissions: Judge0SubmissionPayload[],
  ): Promise<Judge0SubmissionToken[]> {
    const encodedSubmissions = submissions.map((s) => ({
      ...s,
      source_code: Buffer.from(s.source_code).toString("base64"),
      stdin: s.stdin ? Buffer.from(s.stdin).toString("base64") : undefined,
      expected_output: s.expected_output
        ? Buffer.from(s.expected_output).toString("base64")
        : undefined,
      base64_encoded: true,
    }));

    const body = JSON.stringify({
      submissions: encodedSubmissions,
    });

    const result = await this.request<
      Judge0CreateBatchResponse | Judge0SubmissionToken[]
    >("/submissions/batch?base64_encoded=true", {
      method: "POST",
      body,
    });

    // Judge0 can return either an array of tokens or an object with a
    // "submissions" array depending on version/config.
    if (Array.isArray(result)) {
      return result as Judge0SubmissionToken[];
    }

    if (Array.isArray((result as Judge0CreateBatchResponse).submissions)) {
      return (result as Judge0CreateBatchResponse).submissions;
    }

    throw new Error("Unexpected Judge0 batch create response format");
  }

  /**
   * Fetches the results for a batch of submission tokens.
   */
  async getBatchResults(tokens: string[]): Promise<Judge0SubmissionResult[]> {
    if (tokens.length === 0) return [];

    const params = new URLSearchParams({
      tokens: tokens.join(","),
      base64_encoded: "true",
      fields: "stdout,stderr,compile_output,message,status,time,memory",
    });

    const result = await this.request<
      { submissions: Judge0SubmissionResult[] } | Judge0SubmissionResult[]
    >(`/submissions/batch?${params.toString()}`, {
      method: "GET",
    });

    const submissions = Array.isArray(result)
      ? result
      : (result as { submissions: Judge0SubmissionResult[] }).submissions;

    if (!Array.isArray(submissions)) {
      throw new Error("Unexpected Judge0 batch results response format");
    }

    // Decode base64 responses back to UTF-8
    return submissions.map((s) => ({
      ...s,
      stdout: s.stdout
        ? Buffer.from(s.stdout, "base64").toString("utf-8")
        : s.stdout,
      stderr: s.stderr
        ? Buffer.from(s.stderr, "base64").toString("utf-8")
        : s.stderr,
      compile_output: s.compile_output
        ? Buffer.from(s.compile_output, "base64").toString("utf-8")
        : s.compile_output,
      message: s.message
        ? Buffer.from(s.message, "base64").toString("utf-8")
        : s.message,
    }));
  }
}
