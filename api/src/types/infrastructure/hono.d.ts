import type { AuthContext } from "../auth/auth";

declare module "hono" {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}
