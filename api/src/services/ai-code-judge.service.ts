import type { ProblemService } from './problem.service'
import type { GroqJsonResponse } from './groq-llm.service'
import { GroqLlmService } from './groq-llm.service'
import type { SubmissionStatus } from '../mongo/models/submission.model'
import type { ExecutionTestResult, ExecutionVerdict } from '../libs/verdict.util'

export interface AiRunSamplesInput {
  problemId: string
  languageId: string
  languageName: string
  sourceCode: string
  tests: {
    index: number
    input: string
    expected_output: string
  }[]
}

interface AiTestVerdict {
  index: number
  verdict: ExecutionVerdict
  stdout?: string | null
  stderr?: string | null
  compile_output?: string | null
  message?: string | null
}

interface AiRunSamplesOutput {
  tests: AiTestVerdict[]
}

export interface AiRunSamplesResult {
  overallStatus: SubmissionStatus
  tests: ExecutionTestResult[]
  rawLlmResponse: GroqJsonResponse<AiRunSamplesOutput>['raw']
  cached?: boolean
}

const verdictToStatusId: Record<
  ExecutionVerdict,
  { id: number; description: string }
> = {
  ACCEPTED: { id: 3, description: 'Accepted (AI)' },
  WRONG_ANSWER: { id: 4, description: 'Wrong Answer (AI)' },
  TLE: { id: 5, description: 'Time Limit Exceeded (AI)' },
  COMPILATION_ERROR: { id: 6, description: 'Compilation Error (AI)' },
  RUNTIME_ERROR: { id: 7, description: 'Runtime Error (AI)' },
  SYSTEM_ERROR: { id: 13, description: 'Internal Error (AI)' },
}

/**
 * AI-based code judge used as a temporary backend for execution,
 * returning results in the same shape that the real Judge0-based
 * execution service uses.
 */
export class AiCodeJudgeService {
  constructor(
    private readonly llm: GroqLlmService,
    private readonly problemService: ProblemService,
  ) {}

  async runSamples(input: AiRunSamplesInput): Promise<AiRunSamplesResult> {
    const problem = await this.problemService.getProblemById(input.problemId)

    const systemPrompt = [
      'You are acting as an approximate code judge for programming problems.',
      'You will be given a problem, a user submission, and several testcases.',
      'Your job is to SIMULATE what would most likely happen if this code were compiled and run on each testcase.',
      '',
      'Important rules:',
      '- Do NOT just assume the code is correct. Carefully reason about what it actually does.',
      '- For each testcase, decide whether the code would PRODUCE THE EXPECTED OUTPUT or not.',
      '- If the code has obvious compilation errors for the given language, mark verdict as COMPILATION_ERROR.',
      '- If you see clear runtime issues (e.g. null dereference, out-of-bounds), mark verdict as RUNTIME_ERROR.',
      '- If you are uncertain, prefer WRONG_ANSWER over ACCEPTED.',
      '',
      'You MUST respond with a single JSON object of this shape:',
      '{',
      '  "tests": [',
      '    {',
      '      "index": number,',
      '      "verdict": "ACCEPTED" | "WRONG_ANSWER" | "TLE" | "RUNTIME_ERROR" | "COMPILATION_ERROR" | "SYSTEM_ERROR",',
      '      "stdout": string | null,',
      '      "stderr": string | null,',
      '      "compile_output": string | null,',
      '      "message": string | null',
      '    }',
      '  ]',
      '}',
      '',
      'Where:',
      '- index matches the index of the provided testcases (0-based).',
      '- stdout is what the program would likely print for that testcase (if any).',
      '- stderr/compile_output/message are for error or diagnostic messages, if relevant.',
    ].join('\n')

    const userPromptParts: string[] = []

    userPromptParts.push(
      `Language: ${input.languageName} (id: ${input.languageId})`,
    )

    if (problem) {
      userPromptParts.push(
        '',
        'Problem summary:',
        `Title: ${problem.title}`,
        `Description: ${problem.description}`,
      )
    }

    userPromptParts.push(
      '',
      'Testcases (stdin => expected_output):',
    )

    for (const t of input.tests) {
      userPromptParts.push(
        `- index ${t.index}:`,
        `  stdin: ${JSON.stringify(t.input)}`,
        `  expected_output: ${JSON.stringify(t.expected_output)}`,
      )
    }

    userPromptParts.push(
      '',
      'User code:',
      '```',
      input.sourceCode,
      '```',
      '',
      'Reason carefully about this specific code and these specific testcases.',
      'Some testcases might be edge cases or hidden; your evaluation must be strictly accurate based on the problem logic.',
      'Then respond ONLY with the JSON object described above.',
    )

    const { data, raw } = await this.llm.generateJson<AiRunSamplesOutput>({
      systemPrompt,
      userPrompt: userPromptParts.join('\n'),
      temperature: 0,
    })

    if (!Array.isArray(data.tests)) {
      throw new Error('AI execution response did not include tests array')
    }

    const tests: ExecutionTestResult[] = input.tests.map((t) => {
      const aiVerdict = data.tests.find((v) => v.index === t.index)
      const verdict: ExecutionVerdict = aiVerdict?.verdict ?? 'SYSTEM_ERROR'
      const rawStatus = verdictToStatusId[verdict]

      return {
        index: t.index,
        input: t.input,
        expected_output: t.expected_output,
        stdout: aiVerdict?.stdout ?? null,
        stderr: aiVerdict?.stderr ?? null,
        compile_output: aiVerdict?.compile_output ?? null,
        message: aiVerdict?.message ?? null,
        status: verdict,
        rawStatus,
        time: null,
        memory: undefined,
      }
    })

    const overallStatus: SubmissionStatus = tests.every(
      (t) => t.status === 'ACCEPTED',
    )
      ? 'ACCEPTED'
      : 'WRONG_ANSWER'

    return {
      overallStatus,
      tests,
      rawLlmResponse: raw,
    }
  }
}

