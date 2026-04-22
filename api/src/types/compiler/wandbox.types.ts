/**
 * Wandbox API Types
 * Based on official Wandbox API documentation.
 */

export interface WandboxCompiler {
  name: string;
  version: string;
  language: string;
  "display-name": string;
  compiler_option_raw: boolean;
  runtime_option_raw: boolean;
  display_compile_command: string;
  switches: WandboxSwitch[];
  templates: string[];
}

export interface WandboxSwitch {
  name: string;
  type: "select" | "boolean";
  default: string | boolean;
  options?: Array<{
    name: string;
    display_name: string;
    display_flags: string;
  }>;
}

export interface WandboxExecutePayload {
  compiler: string;
  code: string;
  codes?: Array<{ file: string; code: string }>;
  stdin?: string;
  options?: string;
  compiler_option_raw?: string;
  runtime_option_raw?: string;
  save?: boolean;
}

export interface WandboxExecuteResult {
  status: string;
  signal?: string;
  compiler_output?: string;
  compiler_error?: string;
  compiler_message?: string;
  program_output?: string;
  program_error?: string;
  program_message?: string;
  url?: string;
}

/**
 * Standardized result for Coding Arena frontend
 */
export interface CompilerExecutionResponse {
  output: string;
  error?: string;
  exitCode: number;
  time?: string;
  memory?: number;
  url?: string; // Wandbox permalink if saved
}
