import type { SubmissionStatus } from "../../mongo/models/submission.model";
import type { ExecutionTestResult } from "../../libs/utils/verdict.util";
import { GeminiLlmService } from "../ai/gemini-llm.service";
import type { IProblemService } from "../problems/problem.service";
import {
  type AiVerdictAuditInput,
  type AiVerdictAuditResult,
  type AuditOutput,
  type AuditVerdict,
} from "./ai-audit/ai-verdict-audit.types";
import {
  buildAuditSystemPrompt,
  buildAuditUserPrompt,
} from "./ai-audit/ai-verdict-audit.prompt";

import { type ICradle } from "../../libs/awilix-container";

export class AiVerdictAuditService {
  private readonly llm: GeminiLlmService;
  private readonly problemService: IProblemService;

  constructor({ llm, problemService }: ICradle) {
    this.llm = llm;
    this.problemService = problemService;
  }

  async audit(input: AiVerdictAuditInput): Promise<AiVerdictAuditResult> {
    const problem = await this.problemService.getProblemById(input.problemId);
    const systemPrompt = buildAuditSystemPrompt();
    const userPrompt = buildAuditUserPrompt(input, problem);
    const { data, raw } = await this.llm.generateJson<AuditOutput>({
      systemPrompt,
      userPrompt,
      temperature: 0,
      maxTokens: 4096,
    });

    const verdictMap = new Map<number, AuditVerdict>(
      (data.tests ?? []).map((t) => [t.index, t.verdict]),
    );
    const mergedTests = input.tests.map((t) => {
      const auditVerdict = verdictMap.get(t.index);
      return auditVerdict ? { ...t, status: auditVerdict } : t;
    });

    return {
      overallStatus: this.mapAuditVerdictToSubmissionStatus(data.overall_status),
      confidence:
        typeof data.confidence === "number"
          ? Math.max(0, Math.min(1, data.confidence))
          : 0,
      summary: data.summary ?? "AI audit completed",
      tests: mergedTests,
      rawLlmResponse: raw,
    };
  }

  private mapAuditVerdictToSubmissionStatus(verdict: AuditVerdict): SubmissionStatus {
    return verdict;
  }
}
