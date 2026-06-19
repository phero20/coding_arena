import { z } from "zod";
import { createContestSchema, updateContestSchema } from "../../validators/contest/contest.admin.validator";

export type CreateContestPayload = z.infer<typeof createContestSchema>;
export type UpdateContestPayload = z.infer<typeof updateContestSchema>;
