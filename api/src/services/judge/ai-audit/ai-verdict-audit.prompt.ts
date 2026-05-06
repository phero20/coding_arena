import {
  SANITIZE_PROFILES,
  sanitizeDescriptionForAi,
} from "../../../libs/security/prompt-sanitizer";
import type { Problem } from "../../../types/problems/problem.types";
import type { AiVerdictAuditInput } from "./ai-verdict-audit.types";

export function buildAuditSystemPrompt(): string {
  return [
    "You are an AI verdict auditor for coding submissions.",
    "You are NOT the primary executor. Judge0 already executed the code.",
    "Your task is to audit suspicious verdicts and correct likely mislabeled testcase outcomes.",
    "",
    "Rules:",
    "- Use the provided Judge0 status, driver verdict, testcase IO, and user code.",
    "- If testcase expected output is semantically invalid for the problem, mark that testcase as ACCEPTED if user output is correct by problem logic.",
    "- Do not invent compile/runtime errors when Judge0 status clearly indicates successful execution.",
    "- Be conservative. If uncertain, keep driver verdict.",
    "- Return strict JSON only.",
    "",
    "Output shape:",
    "{",
    '  "overall_status": "ACCEPTED" | "WRONG_ANSWER" | "TLE" | "RUNTIME_ERROR" | "COMPILATION_ERROR" | "SYSTEM_ERROR",',
    '  "confidence": number,',
    '  "summary": "string",',
    '  "tests": [{ "index": number, "verdict": "ACCEPTED" | "WRONG_ANSWER" | "TLE" | "RUNTIME_ERROR" | "COMPILATION_ERROR" | "SYSTEM_ERROR", "rationale": "string" }]',
    "}",
  ].join("\n");
}

export function buildAuditUserPrompt(input: AiVerdictAuditInput, problem: Problem | null): string {
  const parts: string[] = [];
  parts.push(
    `Language: ${input.languageName} (id: ${input.languageId})`,
    `Judge0 status: ${input.judge0Status.id} - ${input.judge0Status.description}`,
    `Driver overall status: ${input.driverOverallStatus}`,
    `Driver verdict: ${input.driverVerdict}`,
    `Suspicion reasons: ${input.suspicionReasons.join(", ") || "none"}`,
    `Parser warnings: ${(input.parserWarnings ?? []).join(" | ") || "none"}`,
  );

  if (problem) {
    parts.push(
      "",
      "Problem summary:",
      `Title: ${problem.title}`,
      `Slug: ${problem.problem_slug}`,
      `Description: ${sanitizeDescriptionForAi(problem.description, SANITIZE_PROFILES.STRICT)}`,
    );
  }

  parts.push("", "Driver testcase results:");
  for (const t of input.tests) {
    parts.push(
      `- index ${t.index}:`,
      `  input: ${JSON.stringify(t.input)}`,
      `  expected_output: ${JSON.stringify(t.expected_output)}`,
      `  stdout: ${JSON.stringify(t.stdout)}`,
      `  current_status: ${t.status}`,
    );
  }

  parts.push(
    "",
    "User code:",
    "```",
    input.sourceCode,
    "```",
    "",
    "Return only JSON.",
  );

  return parts.join("\n");
}
