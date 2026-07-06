import { type ILlmService } from "../ai/llm.service";
import { type ICradle } from "../../libs/awilix-container";
import { ProblemModel } from "../../mongo/models/problem.model";
import { ProblemTestModel } from "../../mongo/models/problem-test.model";
import { normalizeTestSuite } from "./testcase-canonical";
import { createLogger } from "../../libs/utils/logger";
import { type FunctionSignature } from "../../types/problems/problem.types";
import { buildTestcaseSystemPrompt, buildTestcaseUserPrompt } from "../../libs/prompts/testcase-generator.prompt";

const logger = createLogger("testcase-generator.service");

const PRIMARY_MODEL_ID = "gemini-3.1-flash-lite";




export interface TestCaseGeneratorResult {
  problemId: string;
  publicCount: number;
  hiddenCount: number;
  rawLlmResponse: any;
}

export class TestcaseGeneratorService {
  private readonly geminiLlmService: ILlmService;

  constructor({ geminiLlmService }: ICradle) {
    this.geminiLlmService = geminiLlmService;
  }

  async generateTestcases(problemId: string): Promise<TestCaseGeneratorResult> {
    logger.info({ problemId }, "Initiating AI test case generation via Google Gemini");

    // 1. Fetch lightweight problem data
    const problem = await ProblemModel.findOne({ problem_id: problemId })
      .select("title description constraints examples function_signature class_signature is_premium topics")
      .lean();

    if (!problem) {
      throw new Error(`Problem not found with ID: ${problemId}`);
    }

    if (problem.is_premium) {
      logger.warn({ problemId }, "Problem is premium — skipping test case generation");
      throw new Error(`Problem ${problemId} is premium and cannot be auto-generated.`);
    }

    if (!problem.function_signature && !problem.class_signature) {
      throw new Error(`Problem ${problemId} is missing a valid function_signature or class_signature.`);
    }

    const isClass = !!problem.class_signature;
    const isDatabase = problem.topics?.includes("Database") || problem.topics?.includes("Pandas");
    const signature = problem.function_signature as FunctionSignature | undefined;
    const classSignature = problem.class_signature as any | undefined;

    const isLongProblem =
      isClass ||
      isDatabase ||
      signature?.params?.some(p => p.type.includes("[][]")) ||
      problem.constraints?.includes("256") ||
      problem.description?.includes("256");

    const publicCount = isLongProblem ? 2 : 3;
    const hiddenCount = isLongProblem ? 3 : 7;

    // 2. Prepare the prompt protocol
    const systemPrompt = buildTestcaseSystemPrompt(publicCount, hiddenCount, isDatabase);

    const originalData = JSON.stringify({
      title: problem.title,
      description: problem.description,
      constraints: problem.constraints,
      examples: problem.examples,
      function_signature: problem.function_signature,
      class_signature: problem.class_signature,
    });

    let lastValidationError: string | null = null;
    let rawAggregate: any;

    // 3. Retry Loop (2 attempts for structural validation)
    for (let attempt = 0; attempt < 2; attempt++) {
      const userPrompt = buildTestcaseUserPrompt(publicCount, hiddenCount, lastValidationError, originalData);

      let data: any = null;
      let rawResponse: any = null;
      let publicTests: any[] = [];
      let hiddenTests: any[] = [];

      try {
        logger.info({ problemId, attempt, model: PRIMARY_MODEL_ID }, `Invoking model (${PRIMARY_MODEL_ID}) for testcase generation`);
        const res = await this.geminiLlmService.generateJson<any>({
          systemPrompt,
          userPrompt,
          temperature: 0.1,
          model: PRIMARY_MODEL_ID,
        });

        if (!res.data?.tests?.public?.length || !res.data?.tests?.hidden?.length) {
          throw new Error("Model failed to return both public and hidden test arrays.");
        }

        // Validate immediately
        const normalized = normalizeTestSuite(
          res.data.tests.public,
          res.data.tests.hidden,
          {
            functionSignature: signature,
            classSignature: classSignature
          }
        );
        publicTests = normalized.publicTests;
        hiddenTests = normalized.hiddenTests;
        data = res.data;
        rawResponse = res.raw;
      } catch (err: any) {
        logger.error({ problemId, attempt, error: err.message }, "Model generation or validation failed");
        lastValidationError = err.message;
        continue;
      }

      rawAggregate = rawResponse;

      try {
        // 5. Upsert to Database
        await ProblemTestModel.updateOne(
          { problem_id: problemId, type: "public" },
          { 
            $set: { 
              cases: publicTests.map(c => ({
                input: c.input,
                expected_output: c.expected_output,
                weight: 1,
                is_sample: true
              }))
            }
          },
          { upsert: true }
        );

        await ProblemTestModel.updateOne(
          { problem_id: problemId, type: "hidden" },
          { 
            $set: { 
              cases: hiddenTests.map(c => ({
                input: c.input,
                expected_output: c.expected_output,
                weight: 1,
                is_sample: false
              }))
            }
          },
          { upsert: true }
        );

        logger.info({ problemId }, `Successfully generated and saved ${publicTests.length + hiddenTests.length} test cases.`);

        return {
          problemId,
          publicCount: publicTests.length,
          hiddenCount: hiddenTests.length,
          rawLlmResponse: rawAggregate,
        };
      } catch (e: any) {
        lastValidationError = e?.message ?? String(e);
        logger.warn({ problemId, attempt, error: lastValidationError }, "Database save failed. Retrying...");
      }
    }

    throw new Error(
      lastValidationError ?? "Test case generation failed after retries: validation did not pass."
    );
  }
}
