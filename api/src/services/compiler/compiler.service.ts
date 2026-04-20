import { ICradle } from "../../libs/awilix-container";
import { redis } from "../../libs/core/redis";
import { createLogger } from "../../libs/utils/logger";
import {
  WandboxCompiler,
  CompilerExecutionResponse,
} from "../../types/compiler/wandbox.types";
import { WandboxService } from "../judge/wandbox.service";
import {
  ExecuteCodeInput,
  ExecuteCodeSchema,
  validateServiceInput,
} from "../validation/compiler.validator";

const logger = createLogger("compiler-service");

/**
 * CompilerService handles high-level execution logic, 
 * result standardization, and compiler list caching.
 */
export class CompilerService {
  private readonly wandboxService: WandboxService;
  private readonly CACHE_KEY = "compiler:languages";
  private readonly CACHE_TTL = 86400; // 24 hours

  constructor({ wandboxService }: ICradle) {
    this.wandboxService = wandboxService;
  }

  /**
   * Fetches available languages/compilers with caching to avoid heavy API hits.
   */
  async getLanguages(): Promise<WandboxCompiler[]> {
    try {
      const cached = await redis.get(this.CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }

      const compilers = await this.wandboxService.getCompilers();
      
      // Cache the result for 24 hours as this list rarely changes
      await redis.set(
        this.CACHE_KEY,
        JSON.stringify(compilers),
        "EX",
        this.CACHE_TTL
      );

      return compilers;
    } catch (err) {
      logger.error({ err }, "Error fetching or caching languages");
      // If redis fails, still try to return results from the direct service
      return this.wandboxService.getCompilers();
    }
  }

  /**
   * Executes code using Wandbox and formats it for the frontend.
   */
  async execute(input: ExecuteCodeInput): Promise<CompilerExecutionResponse> {
    validateServiceInput(ExecuteCodeSchema, input);

    const result = await this.wandboxService.compile({
      compiler: input.compiler,
      code: input.code,
      stdin: input.stdin,
      save: input.save,
    });

    // Standardize the response
    return {
      output: result.program_output || result.compiler_message || "",
      error: result.program_error || result.compiler_error || undefined,
      exitCode: parseInt(result.status || "0"),
      url: result.url,
    };
  }
}
