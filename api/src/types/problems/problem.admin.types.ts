import { z } from "zod";
import { createAdminProblemSchema, updateAdminProblemSchema } from "../../validators/problems/problem.admin.validator";

export type CreateAdminProblemPayload = z.infer<typeof createAdminProblemSchema>;
export type UpdateAdminProblemPayload = z.infer<typeof updateAdminProblemSchema>;
