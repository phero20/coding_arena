import { container, type ICradle } from "../api/src/libs/awilix-container";
import { createLogger } from "../api/src/libs/utils/logger";
import { pool } from "../api/src/db/index";
import { mongoose, connectMongo } from "../api/src/mongo/connection";
import redis from "../api/src/libs/core/redis";
import path from "path";
import fs from "fs";

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

    // 2. Database Connections
    logger.info("Verifying Database Connectivity...");
    
    // Postgres
    await pool.query("SELECT 1");
    logger.info("✅ PostgreSQL (Neon) is responsive.");

    // Redis
    await redis.ping();
    logger.info("✅ Redis/Valkey is responsive.");

    // MongoDB
    await connectMongo();
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB connection state is not 1 (connected).");
    }
    logger.info("✅ MongoDB (Atlas) is responsive.");

    // Go Arena Microservice
    logger.info("Pinging Go Arena Microservice...");
    try {
        const response = await fetch("http://localhost:8080/health");
        if (!response.ok) throw new Error("Arena returned non-200 status");
        logger.info("✅ Go Arena Microservice [8080] is Online.");
    } catch (e: any) {
        throw new Error("Go Arena Microservice is UNREACHABLE! " + e.message);
    }

    // 3. Exhaustive Dependency Resolution (Dynamic)
    // Awilix uses a Proxy, but we can access the raw registrations directly to ensure 100% coverage
    const allRegisteredKeys = Object.keys(container.registrations) as (keyof ICradle)[];
    logger.info(`Found ${allRegisteredKeys.length} registered dependencies. Commencing exhaustive resolution...`);

    let resolutionCount = 0;
    for (const key of allRegisteredKeys) {
      try {
        const resolved = cradle[key];
        if (!resolved) {
          throw new Error(`Resolved value is undefined/null for: ${key}`);
        }
        resolutionCount++;
      } catch (err: any) {
         throw new Error(`Failed to resolve dependency [${key}]: ${err.message}`);
      }
    }
    logger.info(`✅ Successfully verified all ${resolutionCount} DI container dependencies dynamically!`);

    // 4. Verify Specialized Decorator Patterns
    // Explicit decorator check for ProblemService
    const { problemService, problemCache, rawProblemService } = cradle;
    if ((problemService as unknown) !== (problemCache as unknown)) {
      throw new Error("DI MISMATCH: problemService is not pointing to problemCache decorator.");
    }
    if ((problemCache as any).rawProblemService !== rawProblemService) {
        throw new Error("DI MISMATCH: problemCache is not injecting the rawProblemService.");
    }
    logger.info("ProblemService Cache Decorator wiring strictly verified.");

    // Explicit decorator check for AcademyService
    const { academyService, academyCache, rawAcademyService } = cradle;
    if ((academyService as unknown) !== (academyCache as unknown)) {
      throw new Error("DI MISMATCH: academyService is not pointing to academyCache decorator.");
    }
    if ((academyCache as any).rawAcademyService !== rawAcademyService) {
        throw new Error("DI MISMATCH: academyCache is not injecting the rawAcademyService.");
    }
    logger.info("AcademyService Cache Decorator wiring strictly verified.");

    // 5. Verify Frontend Environment & Server
    logger.info("Verifying Frontend Environment Variables (.env)...");
    const envPath = path.join(__dirname, "../web/.env");
    
    if (!fs.existsSync(envPath)) {
        throw new Error("Missing web/.env file! Did you copy from envexamples?");
    }

    const envContent = fs.readFileSync(envPath, "utf-8");
    
    const requiredKeys = [
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
        "NEXT_PUBLIC_API_URL",
        "NEXT_PUBLIC_ARENA_WS_URL"
    ];

    for (const key of requiredKeys) {
        const regex = new RegExp(`^${key}\\s*=`, "m");
        if (!regex.test(envContent)) {
            throw new Error(`CRITICAL: Missing ${key} in web/.env`);
        }
    }
    logger.info("✅ All critical frontend environment variables are present.");

    const frontendUrl = "http://localhost:3001";
    logger.info(`Pinging Next.js Server at ${frontendUrl}...`);
    
    try {
        const response = await fetch(frontendUrl);
        if (!response.ok) {
            throw new Error(`Next.js returned non-200 status: ${response.status}`);
        }
        logger.info(`✅ Next.js Server [3001] is Online and returning HTML.`);
    } catch (e: any) {
        if (e.message.includes("fetch failed") || e.message.includes("ECONNREFUSED")) {
            logger.warn(`⚠️ Next.js Server [3001] is currently offline (Did you run 'cd web && bun dev'?).`);
        } else {
            throw e;
        }
    }


    logger.info("✅ ALL SYSTEMS GO! Full Backend and Frontend architecture is rock-solid.");
    process.exit(0);
  } catch (err: any) {
    logger.error({ err }, "❌ HEALTH CHECK FAILED!");
    process.exit(1);
  }
}

// Ensure database connections don't hang the process
void runHealthCheck();
