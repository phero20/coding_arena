import pino, { type Logger } from "pino";
import { config } from "../../configs/env";

/**
 * Standardized Pino logger instance for the entire application.
 * Configured for structured logging compatible with ELK, CloudWatch, etc.
 */
export const logger = pino({
  name: "coding-arena-api",
  level: config.logLevel || "info",
  transport: config.logPretty
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Creates a child logger with a specific component name.
 * Use this to maintain context while keeping the same pino instance.
 */
export const createLogger = (component: string) => {
  return logger.child({ component });
};

export type ILogger = Logger;
