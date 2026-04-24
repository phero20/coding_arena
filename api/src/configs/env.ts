// ─── Node Env ────────────────────────────────────────────────────────────────

type NodeEnv = "development" | "test" | "production";

const getNodeEnv = (): NodeEnv => {
  const env = (Bun.env.NODE_ENV || "development").toLowerCase();
  if (env === "development" || env === "test" || env === "production") {
    return env as NodeEnv;
  }
  return "development";
};

// ─── Generic Helpers ─────────────────────────────────────────────────────────

const requireEnv = (key: string): string => {
  const value = Bun.env[key];
  if (!value) throw new Error(`Environment variable "${key}" is required but not set.`);
  return value;
};

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseStringList = (value: string | undefined): string[] | undefined => {
  if (!value) return undefined;
  return value.split(",").map((v) => v.trim()).filter((v) => v.length > 0);
};

const parseAudience = (value: string | undefined): string | string[] | undefined => {
  if (!value) return undefined;
  if (value.includes(",")) return parseStringList(value) as string[];
  return value;
};

// ─── Config Shape ────────────────────────────────────────────────────────────

interface EnvConfig {
  // App
  nodeEnv: NodeEnv;
  isDev: boolean;
  isTest: boolean;
  isProd: boolean;
  port: number;
  appName: string;

  // URLs
  apiUrl: string;
  clientUrl: string;

  // Clerk Auth
  clerkSecretKey: string;
  clerkWebhookSecret?: string;
  clerkJwtAudience?: string | string[];
  clerkAuthorizedParties?: string[];

  // Database
  databaseUrl: string;
  mongoUri: string;
  mongoDbName?: string;

  // Judge0
  judge0BaseUrl?: string;
  judge0ApiKey?: string;
  judge0ApiHost?: string;

  // AI
  groqApiKey?: string;

  // Redis
  redisUrl: string;

  // Logging
  logLevel: string;
  logPretty: boolean;
}

// ─── Config Export ───────────────────────────────────────────────────────────

const nodeEnv = getNodeEnv();

export const config: EnvConfig = {
  // App
  nodeEnv,
  isDev: nodeEnv === "development",
  isTest: nodeEnv === "test",
  isProd: nodeEnv === "production",
  port: parseNumber(Bun.env.PORT, 3000),
  appName: Bun.env.APP_NAME || "coding-arena-api",

  // URLs
  apiUrl: Bun.env.API_URL || "http://localhost:3000",
  clientUrl: Bun.env.CLIENT_URL || "http://localhost:3001",

  // Clerk Auth
  clerkSecretKey: requireEnv("CLERK_SECRET_KEY"),
  clerkWebhookSecret: Bun.env.CLERK_WEBHOOK_SECRET,
  clerkJwtAudience: parseAudience(Bun.env.CLERK_JWT_AUDIENCE),
  clerkAuthorizedParties: parseStringList(Bun.env.CLERK_AUTHORIZED_PARTIES),

  // Database
  databaseUrl: requireEnv("DATABASE_URL"),
  mongoUri: requireEnv("MONGODB_URI"),
  mongoDbName: Bun.env.MONGODB_DB_NAME,

  // Judge0
  judge0BaseUrl: Bun.env.JUDGE0_BASE_URL,
  judge0ApiKey: Bun.env.JUDGE0_API_KEY,
  judge0ApiHost: Bun.env.JUDGE0_API_HOST,

  // AI
  groqApiKey: Bun.env.GROQ_API_KEY,

  // Redis
  redisUrl: Bun.env.REDIS_URL || "redis://localhost:6379",

  // Logging
  logLevel: Bun.env.LOG_LEVEL || "info",
  logPretty: Bun.env.LOG_PRETTY === "true",
};
