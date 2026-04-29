import type { User } from "../../db/schema";

export interface AuthContext {
  user: User;
  clerkUserId: string;
  sessionId?: string;
}
