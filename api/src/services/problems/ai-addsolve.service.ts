import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { createLogger } from "../../libs/utils/logger";
import { AppError } from "../../utils/app-error";
import { ERRORS } from "../../constants/errors";
import { type ICradle } from "../../libs/awilix-container";
import type { IProblemRepository } from "../../repositories/problems/problem.repository";
import type { Problem } from "../../types/problems/problem.types";

const BEDROCK_MODEL_ID = "global.anthropic.claude-haiku-4-5-20251001-v1:0";

export class AiAddSolveService {
  private readonly logger = createLogger("ai-addsolve-service");
  private readonly problemRepo: IProblemRepository;
  private readonly bedrockClient: BedrockRuntimeClient;

  constructor({ problemRepository }: ICradle & any) {
    this.problemRepo = problemRepository;
    // AWS SDK automatically picks up AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION from .env
    this.bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });
  }

  /**
   * Fetches a single problem by ID, generates AI solutions + signature/policy fixes
   * via Amazon Bedrock, and persists the result to the database.
   */
  public async processSingleProblem(problemId: string) {
    this.logger.info({ problemId }, "Starting AI solution generation");

    const problem = await this.problemRepo.findByProblemId(problemId);

    if (!problem) {
      this.logger.warn({ problemId }, "Problem not found — aborting generation");
      throw AppError.from(ERRORS.PROBLEM.NOT_FOUND, { problemId });
    }

    if (problem.is_premium) {
      this.logger.warn({ problemId }, "Problem is premium — skipping generation");
      throw AppError.badRequest(`Problem ${problemId} is premium and cannot be auto-generated.`);
    }

    this.logger.info({ problemId, title: problem.title }, "Problem fetched — invoking Bedrock");

    // 1. Build the prompt
    const prompt = this.buildPrompt(problem);

    // 2. Call Amazon Bedrock (throws on any AWS error)
    const rawResponse = await this.invokeClaudeOnBedrock(problemId, prompt);

    // 3. Strip markdown fences if present, then extract the outermost JSON object
    const stripped = rawResponse
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const firstBrace = stripped.indexOf("{");
    const lastBrace = stripped.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      this.logger.error({ problemId, rawResponse }, "Bedrock response contained no JSON object");
      throw AppError.internal(
        "AI response did not contain a valid JSON object.",
        { problemId },
      );
    }

    const jsonOnly = stripped.slice(firstBrace, lastBrace + 1);

    // 4. Parse
    let parsedOutput: any;
    try {
      parsedOutput = JSON.parse(jsonOnly);
    } catch (parseError: any) {
      this.logger.error({ problemId, jsonOnly, cause: parseError.message }, "Failed to parse Bedrock JSON response");
      throw AppError.internal(
        "AI returned malformed JSON that could not be parsed.",
        { problemId, cause: parseError.message },
      );
    }

    // 5. Apply changes
    let shouldUpdate = false;
    const updatedProblem = { ...problem };

    if (parsedOutput.is_signature_inaccurate && parsedOutput.fixed_signature) {
      this.logger.info({ problemId }, "Applying AI-suggested signature fix");
      updatedProblem.problem_type = parsedOutput.fixed_signature.type || problem.problem_type;
      updatedProblem.function_signature = parsedOutput.fixed_signature.function_signature;
      updatedProblem.class_signature = parsedOutput.fixed_signature.class_signature;
      shouldUpdate = true;
    }

    if (parsedOutput.fixed_judging_policy) {
      this.logger.info({ problemId }, "Applying AI-suggested judging policy update");
      updatedProblem.judging_policy = parsedOutput.fixed_judging_policy;
      shouldUpdate = true;
    }

    if (parsedOutput.solutions && parsedOutput.solutions.length > 0) {
      this.logger.info({ problemId, count: parsedOutput.solutions.length }, "Saving generated solutions");
      // Schema field is String — store as serialized JSON so frontend can JSON.parse on demand
      updatedProblem.solutions = JSON.stringify(parsedOutput.solutions);
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      await this.problemRepo.createOrUpdate(updatedProblem);
      this.logger.info({ problemId }, "Problem updated successfully in DB");
    } else {
      this.logger.warn({ problemId }, "No changes detected — DB not updated");
    }

    return updatedProblem;
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  /**
   * Builds the structured prompt sent to Claude 3.5 Sonnet on Bedrock.
   */
  private buildPrompt(problem: Problem): string {
    const jsonStructureExample = {
      is_signature_inaccurate: false,
      fixed_signature: {
        type: "function",
        function_signature: {
          name: "exampleFunc",
          return_type: "int",
          params: [{ name: "arg1", type: "int" }],
        },
        class_signature: null,
      },
      fixed_judging_policy: {
        comparator_mode: "strict",
        multi_answer: false,
        output_order: "any_order",
      },
      solutions: [
        {
          approach_name: "Brute Force",
          time_complexity: "O(N^2)",
          space_complexity: "O(1)",
          editorial_explanation:
            "## Intuition\n\nExplain the core idea here.\n\n## Algorithm\n\nStep-by-step walkthrough.\n\n## Complexity\n\n- **Time:** O(N^2)\n- **Space:** O(1)",
          implementations: [
            { language: "python", code: "def exampleFunc(arg1):\n    return arg1" },
            { language: "java", code: "class Solution {\n    public int exampleFunc(int arg1) { return arg1; }\n}" },
          ],
        },
        {
          approach_name: "Optimal Two Pointer",
          time_complexity: "O(N)",
          space_complexity: "O(1)",
          editorial_explanation:
            "## Intuition\n\nExplain the optimal approach here.\n\n## Algorithm\n\nStep-by-step walkthrough.\n\n## Complexity\n\n- **Time:** O(N)\n- **Space:** O(1)",
          implementations: [
            { language: "python", code: "def exampleFunc(arg1):\n    return arg1" },
            { language: "cpp", code: "class Solution {\npublic:\n    int exampleFunc(int arg1) { return arg1; }\n};" },
          ],
        },
      ],
    };

    // Strip HTML tags from description to reduce unnecessary input tokens
    const cleanDescription =
      problem.description?.replace(/<[^>]*>?/gm, "") || "No description provided.";

    return `
You are an expert competitive programmer and algorithmic engineer.
Review the following problem, its current signature, and its judging policy.

IMPORTANT: The problem description below is the absolute source of truth.
If the problem title matches a well-known competitive programming problem, you MAY use that background knowledge ONLY if it is fully consistent with the provided description. If there is any conflict, always defer to the description.

PROBLEM TITLE: ${problem.title}
PROBLEM DESCRIPTION:
${cleanDescription}

CURRENT SIGNATURE:
${JSON.stringify({ func: problem.function_signature, cls: problem.class_signature }, null, 2)}

CURRENT JUDGING POLICY:
${JSON.stringify(problem.judging_policy || {}, null, 2)}

CRITICAL RULES:
1. Do NOT suggest changes to the problem title, description, hints, or any other fields.
2. ONLY evaluate the function/class signature and the judging policy.
3. Each approach is ONE algorithmic idea. Do NOT create a separate approach entry just to show the same algorithm in a different language.
4. Each approach has an 'implementations' array — place multiple language implementations inside it, not as separate approaches.
5. Valid language strings for 'implementations': "java", "python", "c#", "cpp", "js". Do NOT use any other value.

TASK 1: Verify the signature. If it is mathematically wrong, missing arguments, or inaccurate for the problem description, fix it according to the schema. Otherwise, return the existing one and set is_signature_inaccurate to false.
TASK 2: Verify the judging_policy. If the problem requires returning values in any order (e.g. "return elements in any order"), set output_order to "any_order". Always return this field.
TASK 3: Generate between 1 and 3 distinct solution approaches depending on the nature and complexity of the problem.
  - If only ONE meaningful approach exists (e.g. pure Binary Search, pure BFS), return exactly 1. Do NOT invent redundant variations just to meet a count.
  - If two genuinely different strategies exist (e.g. Brute Force + Hash Map, Iterative + Recursive), return 2.
  - If three progressively better approaches exist (e.g. Recursion → Memoization → Bottom-up DP), return 3.
  - Prefer the pattern: Brute Force → Better → Optimal. Never repeat the same algorithm with minor tweaks.
  - Only include approaches that provide real educational value and represent distinct algorithmic ideas.
  For EACH approach, provide:
  - approach_name: A short name (e.g. "Brute Force", "Hash Map", "Two Pointer", "Bottom-up DP")
  - time_complexity: Big-O notation
  - space_complexity: Big-O notation
  - editorial_explanation: A rich GitHub Flavored Markdown string with ## Intuition, ## Algorithm, and ## Complexity sections
  - implementations: An array of { language, code } objects — include 2 to 3 languages per approach (e.g. python + java, or python + cpp + java). Each must be the full executable implementation of THIS approach in that language.

CRITICAL INSTRUCTION: You MUST return your response as a raw, valid JSON object. Do NOT wrap the JSON in markdown code blocks (\`\`\`json). Return purely the JSON text, following this exact structure:
${JSON.stringify(jsonStructureExample, null, 2)}
`;
  }

  /**
   * Invokes Claude 3.5 Sonnet v2 through Amazon Bedrock.
   * Throws a descriptive AppError on any AWS failure so the caller can surface it.
   */
  private async invokeClaudeOnBedrock(problemId: string, prompt: string): Promise<string> {
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 8192, // Large enough for Hard problems with 3 full solutions + editorials
      temperature: 0.1, // Low temperature for deterministic, reproducible code
      messages: [{ role: "user", content: prompt }],
    };

    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    try {
      const response = await this.bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.content[0].text;
    } catch (error: any) {
      this.logger.error(
        { problemId, errorName: error.name, errorMessage: error.message },
        "Amazon Bedrock invocation failed",
      );
      throw AppError.serviceUnavailable(
        `Bedrock request failed [${error.name ?? "UnknownError"}]: ${error.message}`,
        { problemId },
      );
    }
  }
}
