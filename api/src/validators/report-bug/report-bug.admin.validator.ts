import { z } from "zod";

export const createBugReportSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['bug', 'ui', 'feature', 'feedback']),
  images: z.array(z.string()).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional().default('open'),
});

export const updateBugReportSchema = createBugReportSchema.partial();
