/**
 * Standard type definitions for code submission evaluations.
 * This ensures type safety across the worker, service, and repository layers.
 */

export type SubmissionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TLE'
  | 'RUNTIME_ERROR'
  | 'COMPILATION_ERROR'
  | 'SYSTEM_ERROR'
  | 'COMPILE_ERROR' // Keeping as alias or legacy if needed
  | 'NOT_SUBMITTED';

export interface TestCaseResult {
  status: SubmissionStatus;
  index: number;
  message?: string | null;
  input?: string;
  expected_output?: string;
  stdout?: string | null;
  stderr?: string | null;
  executionTime?: number;
  memoryUsed?: number;
  time?: string | null;
}

export interface EvaluationResultData {
  status: SubmissionStatus;
  tests?: TestCaseResult[];
  testsPassed?: number;
  totalTests?: number;
  error?: string;
}

export interface Submission {
  id: string;
  problemId: string;
  userId: string;
  languageId: string;
  sourceCode: string;
  status: SubmissionStatus;
  time?: number;
  memory?: number;
  details?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubmissionInput {
  problemId: string;
  userId: string;
  languageId: string;
  sourceCode: string;
  status?: SubmissionStatus;
}

export interface UpdateSubmissionInput {
  status?: SubmissionStatus;
  time?: number;
  memory?: number;
  details?: any;
}
