import { z } from "zod";

export const createCompanySchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  name: z.string().min(1, "Name is required"),
  imageUrl: z.string().optional(),
  problem_ids: z.array(z.string()).default([]),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
