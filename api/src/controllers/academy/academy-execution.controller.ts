import { BaseController } from "../base.controller";
import { type AcademyExecutionService } from "../../services/academy/academy-execution.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import { AppError } from "../../utils/app-error";
import { createLogger } from "../../libs/utils/logger";
import { z } from "zod";

const logger = createLogger("academy-execution.controller");

export const RunAcademyExerciseSchema = z.object({
  userCode: z.string().min(1, "User code is required"),
  testCode: z.string().min(1, "Test code is required"),
});

export type RunAcademyExerciseDto = z.infer<typeof RunAcademyExerciseSchema>;

export class AcademyExecutionController extends BaseController {
  private readonly academyExecutionService: AcademyExecutionService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.academyExecutionService = cradle.academyExecutionService;
  }

  async runExercise(
    req: ControllerRequest<
      RunAcademyExerciseDto,
      { trackSlug: string; exerciseSlug: string },
      never
    >
  ) {
    const { trackSlug, exerciseSlug } = req.params;
    const { userCode, testCode } = req.body;
    
    // Auth context (Assuming standard setup where req.user is set by auth middleware)
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", { statusCode: 401 });
    }

    if (!trackSlug || !exerciseSlug) {
      throw new AppError("Track slug and exercise slug are required", { statusCode: 400 });
    }

    try {
      logger.info({ userId, trackSlug, exerciseSlug }, "Executing academy exercise");
      
      // We will define this method in AcademyService next!
      const result = await this.academyExecutionService.runExercise({
        userId,
        trackSlug,
        exerciseSlug,
        userCode,
        testCode,
      });

      return result;
    } catch (error: any) {
      logger.error({ err: error, trackSlug, exerciseSlug }, "Failed to execute academy exercise");
      throw new AppError("Execution failed", { statusCode: 500, details: error.message });
    }
  }
}
