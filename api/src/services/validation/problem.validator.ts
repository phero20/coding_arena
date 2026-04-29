import { z } from "zod";
import { validateServiceInput } from "./submission.validator";

export { validateServiceInput };

export const GetProblemSchema = z.object({
  id: z.string().min(1),
});

export const GetProblemsSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  difficulty: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
