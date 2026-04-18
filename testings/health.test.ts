import { container, type ICradle } from "../api/src/libs/awilix-container";
import { createLogger } from "../api/src/libs/logger";

const logger = createLogger("health-check-test");

/**
 * PRODUCTION-READY HEALTH CHECK
 * This script verifies that the Awilix DI container is correctly wired
 * and that all critical services can be resolved without runtime errors.
 */
async function runHealthCheck() {
  logger.info("Starting Backend Infrastructure Health Check...");

  try {
    // 1. Verify Container Integrity
    const cradle = container.cradle;
    logger.info("Awilix Container cradle accessed successfully.");

    // 2. Test Dependency Resolution (Core Services)
    const servicesToVerify: (keyof ICradle)[] = [
      "problemService",
      "submissionService",
      "authService",
      "aiCodeJudgeService",
      "arenaService",
      "matchValidatorService",
      "submissionEvaluator",
    ];

    for (const serviceName of servicesToVerify) {
      const service = cradle[serviceName];
      if (!service) {
        throw new Error(`Failed to resolve service: ${serviceName}`);
      }
      logger.info(`Resolved ${serviceName} successfully.`);
    }

    // 3. Verify Cache Wiring (Decorator Pattern Check)
    const { problemService, problemCache, rawProblemService } = cradle;
    
    // Cast to unknown first to allow comparison of logically related but structurally distinct classes
    if ((problemService as unknown) !== (problemCache as unknown)) {
      throw new Error("DI MISMATCH: problemService is not pointing to problemCache decorator.");
    }
    
    // Use type assertion to check the internal property of our decorator
    if ((problemCache as any).rawProblemService !== rawProblemService) {
        throw new Error("DI MISMATCH: problemCache is not injecting the rawProblemService.");
    }
    
    logger.info("Cache Decorator wiring verified.");

    // 4. Verify Repositories
    const reposToVerify: (keyof ICradle)[] = ["userRepository", "problemRepository", "submissionRepository"];
    for (const repoName of reposToVerify) {
      const repo = cradle[repoName];
      if (!repo) {
        throw new Error(`Failed to resolve repository: ${repoName}`);
      }
      logger.info(`Resolved ${repoName} repository successfully.`);
    }

    logger.info("✅ ALL SYSTEMS GO! Backend architecture is rock-solid.");
    process.exit(0);
  } catch (err: any) {
    logger.error({ err }, "❌ HEALTH CHECK FAILED!");
    process.exit(1);
  }
}

// Ensure database connections don't hang the process
void runHealthCheck();
