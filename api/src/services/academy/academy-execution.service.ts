import { type ICradle } from "../../libs/awilix-container";
import { TEST_SUPPORTED_LANGUAGES } from "./constants";
import { combine, getParser, getTrackConfig } from "../../../../driver/exercise-drivers";
import { AppError } from "../../utils/app-error";
import { createLogger } from "../../libs/utils/logger";
import { type Judge0SubmissionResult } from "../judge/judge0.service";
import fs from "fs/promises";
import path from "path";
import { redis } from "../../libs/core/redis";

const logger = createLogger("academy-execution.service");

export interface RunExerciseParams {
  userId: string;
  trackSlug: string;
  exerciseSlug: string;
  userCode: string;
  testCode: string;
}

export class AcademyExecutionService {
  private readonly academyRepository: ICradle["academyRepository"];
  private readonly judge0Service: ICradle["judge0Service"];
  private readonly academyAiJudgeService: ICradle["academyAiJudgeService"];
  private readonly userRepository: ICradle["userRepository"];
  private readonly statsRepository: ICradle["statsRepository"];
  private readonly leaderboardCache: ICradle["leaderboardCache"];
  private readonly statsService: ICradle["statsService"];
  private readonly submissionService: ICradle["submissionService"];

  constructor(cradle: ICradle) {
    this.academyRepository = cradle.academyRepository;
    this.judge0Service = cradle.judge0Service;
    this.academyAiJudgeService = cradle.academyAiJudgeService;
    this.userRepository = cradle.userRepository;
    this.statsRepository = cradle.statsRepository;
    this.leaderboardCache = cradle.leaderboardCache;
    this.statsService = cradle.statsService;
    this.submissionService = cradle.submissionService;
  }

  async runExercise(params: RunExerciseParams) {
    const { userId, trackSlug, exerciseSlug, userCode, testCode } = params;

    const trackConfig = getTrackConfig(trackSlug);
    const languageId = trackConfig?.judge0Id || 0;
    
    // TEMPORARY: Force all execution through AI Judge until Mini-Judge0 is built
    const isFullySupported = false; // TEST_SUPPORTED_LANGUAGES.has(trackSlug.toLowerCase());

    if (!isFullySupported) {
      logger.info({ trackSlug, exerciseSlug }, "Routing to AI Judge");
      
      let instructions = "Instructions not found.";
      try {
        const exerciseData = await this.academyRepository.getTrackExercise(trackSlug, exerciseSlug);
        if (exerciseData && exerciseData.instructions) {
          instructions = exerciseData.instructions;
        } else {
          logger.warn({ trackSlug, exerciseSlug }, "Instructions missing from exercise JSON in database");
        }
      } catch (err: any) {
        logger.warn({ err: err.message, trackSlug, exerciseSlug }, "Failed to load instructions from database for AI Judge");
      }

      const aiResult = await this.academyAiJudgeService.evaluate({
        trackSlug,
        userCode,
        testCode,
        instructions,
      });

      await this.handleGamification(userId, trackSlug, exerciseSlug, aiResult.passed);
      await this.storeSubmission(userId, trackSlug, exerciseSlug, userCode, aiResult.passed ? "ACCEPTED" : "WRONG_ANSWER");

      return aiResult;
    }

    logger.info({ trackSlug, exerciseSlug }, "Running via Driver test pipeline");
    
    if (!trackConfig) {
      throw new AppError(`Track '${trackSlug}' is not supported for execution.`, { statusCode: 400 });
    }

    const combined = combine({
      trackSlug,
      exerciseSlug,
      userCode,
      testCode,
    });

    const payload = {
      source_code: combined.sourceCode,
      language_id: trackConfig.judge0Id,
      compiler_options: combined.compilerOptions,
    };

    const judgeRaw = await this.executeAndPoll(payload, `${userId}-${exerciseSlug}`);

    const parser = getParser(trackConfig.testRunner);
    const combinedOutput = (judgeRaw.stdout || "") + "\n" + (judgeRaw.stderr || "");
    const finalResult = parser(combinedOutput);
    
    // If there's a compilation error from Judge0, attach it.
    if (judgeRaw.compile_output && !finalResult.compileError) {
      finalResult.compileError = judgeRaw.compile_output;
    }

    await this.handleGamification(userId, trackSlug, exerciseSlug, finalResult.passed);
    await this.storeSubmission(userId, trackSlug, exerciseSlug, userCode, finalResult.passed ? "ACCEPTED" : (finalResult.compileError ? "COMPILATION_ERROR" : "WRONG_ANSWER"));

    return finalResult;
  }

  private async storeSubmission(userId: string, trackSlug: string, exerciseSlug: string, userCode: string, status: string) {
    try {
      let user = await this.userRepository.findByClerkId(userId);
      if (!user) {
        user = await this.userRepository.findById(userId);
      }
      if (!user) return;
      
      await this.submissionService.createSubmission({
        problemId: `${trackSlug}:${exerciseSlug}`,
        problemTitle: `Academy: ${exerciseSlug}`,
        userId: user.id,
        languageId: trackSlug,
        sourceCode: userCode,
        status: status as any,
      });
    } catch (err) {
      logger.error({ err, userId }, "Failed to store academy submission to DB");
    }
  }

  /**
   * Helper to submit the code to Judge0 and poll until it's finished.
   */
  private async executeAndPoll(
    payload: {
      source_code: string;
      language_id: number;
      compiler_options?: string;
    },
    traceId?: string,
  ): Promise<Judge0SubmissionResult> {
    const created = await this.judge0Service.createBatchSubmissions([payload]);
    const token = created[0]?.token;

    if (!token) {
      throw new AppError("Judge0 did not return a submission token", { statusCode: 500 });
    }

    const maxPollAttempts = 25; // 25 * 300ms = 7.5 seconds
    for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
      const [result] = await this.judge0Service.getBatchResults([token]);
      if (!result) {
        throw new AppError("Judge0 did not return a submission result", { statusCode: 500 });
      }

      // Status 1 = In Queue, Status 2 = Processing. Anything else means it's finished.
      if (result.status.id !== 1 && result.status.id !== 2) {
        return result;
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    logger.error({ traceId, token }, "Judge0 polling timed out");
    throw new AppError("Execution timed out", { statusCode: 408 });
  }

  private async handleGamification(userId: string, trackSlug: string, exerciseSlug: string, passed: boolean) {
    try {
      let user = await this.userRepository.findByClerkId(userId);
      if (!user) {
        user = await this.userRepository.findById(userId);
      }
      if (!user) {
        logger.warn({ userId }, "User not found for gamification");
        return;
      }
      
      const postgresUserId = user.id;

      // Log submission activity
      await this.statsRepository.logActivity(postgresUserId, 0, 0, true, false);

      if (passed) {
        const isNewSolve = await this.academyRepository.markExerciseSolved(postgresUserId, trackSlug, exerciseSlug);

        if (isNewSolve) {
          try {
            await redis.del(`academy:solved:${postgresUserId}:${trackSlug}`);
            await redis.del(`academy:solved:${postgresUserId}:all`);
          } catch (err) {
            logger.error({ err, postgresUserId, trackSlug }, "Failed to invalidate academy solved cache");
          }

          const points = 10;
          const [updatedStats] = await this.statsRepository.updateUserStats({
            userId: postgresUserId,
            points,
            difficulty: 'easy',
            isMatch: false,
            source: 'academy',
          });

          if (updatedStats) {
            await Promise.all([
              this.leaderboardCache.updateScore(postgresUserId, updatedStats.totalPoints),
              this.leaderboardCache.updateUserMetadata({
                ...user,
                totalSolved: updatedStats.totalSolved
              })
            ]);
          }

          await this.statsRepository.logActivity(postgresUserId, points, 0, false, false);
          
          const problemIdForLang = `academy_${trackSlug}_${exerciseSlug}`;
          const isNewLang = await this.statsRepository.recordSolvedLanguage(postgresUserId, problemIdForLang, trackSlug);
          if (isNewLang) {
            await this.statsRepository.updateLanguageCount(postgresUserId, trackSlug);
          }
        }

        await this.statsRepository.updateStreak(postgresUserId);
        await this.statsService.invalidateProfile(postgresUserId);
      }
    } catch (err: any) {
      logger.error({ err: err.message, userId, trackSlug, exerciseSlug }, "Failed to process academy gamification");
    }
  }
}
