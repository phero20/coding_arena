import { z } from "zod";

export const createContestSchema = z.object({
  title: z.string().min(1),
  clistId: z.coerce.number().optional(),
  description: z.string().optional().nullable(),
  platform: z.string().min(1),
  startTime: z.string().datetime().transform((val) => new Date(val)),
  endTime: z.string().datetime().transform((val) => new Date(val)),
  duration: z.number().int().positive(),
  href: z.string().url(),
  resourceId: z.number().int().optional().nullable(),
  icon: z.string().optional().nullable(),
  status: z.string().optional().default("upcoming"),
});

export const updateContestSchema = createContestSchema.partial();
