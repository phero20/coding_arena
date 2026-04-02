type NodeEnv = "development" | "test" | "production";

interface EnvConfig {
  nodeEnv: NodeEnv;
  isDev: boolean;
  isTest: boolean;
  isProd: boolean;
  port: number;
  appName: string;
  apiUrl: string;
  clientUrl: string;
  jwtSecret?: string;
  clerkSecretKey: string;
  clerkWebhookSecret?: string;
  clerkJwtAudience?: string | string[];
  clerkAuthorizedParties?: string[];
  databaseUrl: string;
  mongoUri: string;
  mongoDbName?: string;
  judge0BaseUrl?: string;
  judge0ApiKey?: string;
  judge0ApiHost?: string;
  groqApiKey?: string;
  redisUrl?: string;
  upstashRedisRestUrl?: string;
  upstashRedisRestToken?: string;
}

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getNodeEnv = (): NodeEnv => {
  const env = (Bun.env.NODE_ENV || "development").toLowerCase();

  if (env === "development" || env === "test" || env === "production") {
    return env;
  }

  return "development";
};

const env = getNodeEnv();

const ensureDatabaseUrl = (): string => {
  const value = Bun.env.DATABASE_URL;
  if (!value) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return value;
};

const ensureClerkSecretKey = (): string => {
  const value = Bun.env.CLERK_SECRET_KEY;
  if (!value) {
    throw new Error("CLERK_SECRET_KEY environment variable is not set");
  }
  return value;
};

const ensureMongoUri = (): string => {
  const value = Bun.env.MONGODB_URI;
  if (!value) {
    throw new Error("MONGODB_URI environment variable is not set");
  }
  return value;
};

const parseStringList = (value: string | undefined): string[] | undefined => {
  if (!value) return undefined;
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
};

const parseAudience = (
  value: string | undefined,
): string | string[] | undefined => {
  if (!value) return undefined;
  if (value.includes(",")) {
    return parseStringList(value) as string[];
  }
  return value;
};

export const config: EnvConfig = {
  nodeEnv: env,
  isDev: env === "development",
  isTest: env === "test",
  isProd: env === "production",
  port: parseNumber(Bun.env.PORT, 3000),
  appName: Bun.env.APP_NAME || "coding-arena-api",
  apiUrl: Bun.env.API_URL || "http://localhost:3000",
  clientUrl: Bun.env.CLIENT_URL || "http://localhost:3001",
  jwtSecret: Bun.env.JWT_SECRET,
  clerkSecretKey: ensureClerkSecretKey(),
  clerkWebhookSecret: Bun.env.CLERK_WEBHOOK_SECRET,
  clerkJwtAudience: parseAudience(Bun.env.CLERK_JWT_AUDIENCE),
  clerkAuthorizedParties: parseStringList(Bun.env.CLERK_AUTHORIZED_PARTIES),
  databaseUrl: ensureDatabaseUrl(),
  mongoUri: ensureMongoUri(),
  mongoDbName: Bun.env.MONGODB_DB_NAME,
  judge0BaseUrl: Bun.env.JUDGE0_BASE_URL,
  judge0ApiKey: Bun.env.JUDGE0_API_KEY,
  judge0ApiHost: Bun.env.JUDGE0_API_HOST,
  groqApiKey: Bun.env.GROQ_API_KEY,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  upstashRedisRestUrl: Bun.env.UPSTASH_REDIS_REST_URL,
  upstashRedisRestToken: Bun.env.UPSTASH_REDIS_REST_TOKEN,
};
