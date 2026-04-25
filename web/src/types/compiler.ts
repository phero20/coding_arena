export interface CompilerLanguage {
  name: string;
  language: string;
  display_name: string;
  version: string;
}

export interface CompilerExecutePayload {
  compiler: string;  // Wandbox compiler ID, e.g. "cpython-3.12.3"
  code: string;
  stdin?: string;
  save?: boolean;
}

export interface CompilerExecuteResponse {
  output: string;
  error?: string;
  exitCode: number;
  url?: string;
}
