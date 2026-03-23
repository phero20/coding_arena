import type { Judge0SubmissionResult } from '../services/judge0.service'

export type ExecutionVerdict =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TLE'
  | 'RUNTIME_ERROR'
  | 'COMPILATION_ERROR'
  | 'SYSTEM_ERROR'

export interface ExecutionTestResult {
  index: number
  input: string
  expected_output: string
  stdout?: string | null
  stderr?: string | null
  compile_output?: string | null
  message?: string | null
  status: ExecutionVerdict
  rawStatus: Judge0SubmissionResult['status']
  time?: string | null
  memory?: number | null
}

const normalize = (value: string | null | undefined): string =>
  (value ?? '').trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n')

export const mapJudge0ToExecutionVerdict = (
  result: Judge0SubmissionResult,
  expectedOutput: string,
): ExecutionVerdict => {
  const statusId = result.status.id

  // Accepted at Judge0 level
  if (statusId === 3) {
    const actual = normalize(result.stdout)
    const expected = normalize(expectedOutput)
    return actual === expected ? 'ACCEPTED' : 'WRONG_ANSWER'
  }

  switch (statusId) {
    case 4:
      return 'WRONG_ANSWER'
    case 5:
      return 'TLE'
    case 6:
      return 'COMPILATION_ERROR'
    case 7:
    case 8:
    case 9:
      return 'RUNTIME_ERROR'
    default:
      return 'SYSTEM_ERROR'
  }
}

