import { Hono } from "hono";
import { cors } from "hono/cors";
import { registerRoutes } from "./routes";
import { requestLogger } from "./middlewares/request-logger.middleware";
import { AppError } from "./utils/app-error";
import { ApiResponse } from "./utils/api-response";
import { config } from "./configs/env";
import { connectMongo } from "./mongo/connection";

void connectMongo();

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => {
      // In development, echo the origin to avoid common local networking issues (localhost vs 127.0.0.1 vs [::1])
      if (config.isDev) return origin;
      return [config.clientUrl, "http://127.0.0.1:3001"].includes(origin)
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
  }),
);

app.use("*", requestLogger);

// Global Error Handler
app.onError((err, c) => {
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof Error) {
    appError = AppError.internal(err.message, undefined, err);
  } else {
    appError = AppError.internal("Unexpected error", err, undefined);
  }

  console.error(`[Error] ${appError.code}: ${appError.message}`);

  const response = ApiResponse.failure(
    appError.code,
    appError.message,
    appError.details
  );

  return c.json(response.toJSON(), appError.statusCode as any);
});

registerRoutes(app);

export default {
  fetch: app.fetch,
};
