import { z } from "zod";
import { validateServiceInput } from "./submission.validator";

export { validateServiceInput };

export const SyncUserSchema = z.object({
  clerkId: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(1),
  avatarUrl: z.string().optional(),
});
