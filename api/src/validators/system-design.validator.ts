import { z } from "zod";

export const createSystemDesignTopicSchema = z.object({
  topic_id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().min(1),
  content: z.string().min(1),
});

export type CreateSystemDesignTopicInput = z.infer<typeof createSystemDesignTopicSchema>;
