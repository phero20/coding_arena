import type { Input } from "hono";
import type { AuthContext } from "./auth";

/**
 * Standard Hono Environment for the Coding Arena API.
 * Includes common variables like 'auth'.
 */
export type AppEnv = {
  Variables: {
    auth: AuthContext;
  };
};

/**
 * Utility type to extend Context with specific JSON validation schemas.
 * Matches Hono's internal Input structure for zValidator.
 */
export type ValidatedContext<T = any> = {
  in: { json: T };
  out: { json: T };
};

/**
 * Standard data transfer object for controller methods.
 * Decoupled from any framework-specific context (e.g. Hono's Context).
 */
export interface ControllerRequest<TBody = any, TParams = any, TQuery = any> {
  body: TBody;
  params: TParams;
  query: TQuery;
  user?: AuthContext["user"];
  clerkUserId?: string;
  requestId?: string;
}
