import { z } from "zod";

export const createCompanySchema = z.object({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  name: z.string().min(1, "Name is required"),
  imageUrl: z.string().optional().nullable(),
  problem_ids: z.array(z.string()).optional(),
});

export const updateCompanySchema = createCompanySchema.partial();
