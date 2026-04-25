import { cors } from "hono/cors";
import { config } from "./env";

/**
 * Global CORS Configuration.
 * Handles origin verification and allowed headers for the platform.
 */
export const corsConfig = () =>
  cors({
    origin: (origin) => {
      // In development, allow any origin (facilitates local testing)
      if (origin && config.isDev) return origin;

      // In production, strictly whitelist allowed clients
      return origin &&
        [config.clientUrl, "http://127.0.0.1:3001"].includes(origin)
        ? origin
        : config.clientUrl;
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "Clerk-Auth-Token",
      "x-clerk-auth-token",
    ],
    maxAge: 86400,
    credentials: true,
  });
