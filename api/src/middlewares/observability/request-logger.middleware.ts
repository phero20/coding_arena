import type { Context, Next } from "hono";
import { logger } from "../../libs/utils/logger";
import { type IClockService } from "../../services/common/clock.service";
import { type ICradle } from "../../libs/awilix-container";

export class RequestLoggerMiddleware {
  private readonly clock: IClockService;

  constructor({ clockService }: ICradle) {
    this.clock = clockService;
  }

  async handle(c: Context, next: Next) {
    const start = this.clock.now();
    const { method } = c.req;
    const path = c.req.path;
    const traceId = c.get("requestId");

    await next();

    const durationMs = this.clock.now() - start;
    const status = c.res.status;

    logger.info(
      {
        type: "request",
        method,
        path,
        status,
        durationMs,
        traceId,
      },
      `${method} ${path} -> ${status} (${durationMs}ms)`,
    );
  }
}
