import { Hono } from "hono";
import { cors } from "hono/cors";
import { registerRoutes } from "./routes";
import { container } from "./libs/awilix-container";
import { AppError } from "./utils/app-error";
import { ApiResponse } from "./utils/api-response";
import { config } from "./configs/env";
import { logger } from "./libs/utils/logger";
import type { AppEnv } from "./types/infrastructure/hono.types";

import { requestId } from "hono/request-id";
import { corsConfig } from "./configs/cors";

export function createApp(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  // 1. Core Global Middlewares
  app.use("*", requestId());
  app.use("*", corsConfig());

  // 2. Global Error Handling
  const { requestLoggerMiddleware, errorMiddleware } = container.cradle;
  app.use("*", (c, next) => requestLoggerMiddleware.handle(c, next));

  app.onError((err, c) => errorMiddleware.handle(err, c));

  // 3. Route Registration
  registerRoutes(app);

  return app;
}
