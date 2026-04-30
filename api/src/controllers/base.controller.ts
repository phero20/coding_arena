import type { Context } from "hono";
import { ApiResponse } from "../utils/api-response";
import { AppError } from "../utils/app-error";
import type {
  AppEnv,
  ValidatedContext,
  ControllerRequest,
} from "../types/infrastructure/hono.types";

import { type ICradle } from "../libs/awilix-container";

/**
 * BaseController provides common utility methods to reduce boilerplate
 * in API controllers. It centralizes authentication extraction, JSON
 * parsing, and response formatting.
 */
export abstract class BaseController {
  constructor(_: ICradle) {}

  /**
   * Safely extracts the authentication context.
   * Throws AppError.unauthorized if the auth context is missing.
   */
  protected getAuth(c: Context<AppEnv>) {
    const auth = c.get("auth");
    if (!auth) throw AppError.unauthorized();
    return auth;
  }

  /**
   * Extracts the pre-validated JSON body from the request.
   */
  protected getBody<T>(c: Context<any, any, ValidatedContext<T>>): T {
    return c.req.valid("json");
  }

  /**
   * Returns a standard 200 OK success response.
   */
  protected ok(c: Context, data: any) {
    return c.json(ApiResponse.success(data).toJSON());
  }

  /**
   * Standard 201 Created success response.
   */
  protected created(c: Context, data: any) {
    return c.json(ApiResponse.success(data).toJSON(), 201);
  }

  /**
   * Action wrapper that bridges Hono's Context with a 'pure' controller method.
   * This allows controllers to be unit-tested with plain POJO objects.
   */
  public action<TBody = any, TParams = any, TQuery = any, TResponse = any>(
    handler: (
      req: ControllerRequest<TBody, TParams, TQuery>,
    ) => Promise<TResponse>,
    options: { status?: number; requireAuth?: boolean } = {
      status: 200,
      requireAuth: true,
    },
  ) {
    return async (c: Context<AppEnv, any, ValidatedContext<TBody>>) => {
      const auth = c.get("auth");

      // Only throw 401 if authentication is explicitly required (default is true)
      if (options.requireAuth && !auth) {
        throw AppError.unauthorized();
      }

      // Standardized extraction layer
      // We prioritize validated data (Zod transforms) over raw request data.
      const controllerReq: ControllerRequest<TBody, TParams, TQuery> = {
        body: c.req.valid("json" as any),
        params: (c.req as any).valid?.("param") || (c.req.param() as any),
        query: (c.req as any).valid?.("query") || (c.req.query() as any),
        user: auth?.user,
        clerkUserId: auth?.clerkUserId,
        requestId: c.get("requestId"),
      };

      const result = await handler.call(this, controllerReq);

      // Standardized response wrapping
      if (result instanceof ApiResponse) {
        return c.json(result.toJSON(), (options.status ?? 200) as any);
      }

      return c.json(
        ApiResponse.success(result).toJSON(),
        (options.status ?? 200) as any,
      );
    };
  }
}
