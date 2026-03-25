import type { AuthContext } from './auth'

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext
  }
}

