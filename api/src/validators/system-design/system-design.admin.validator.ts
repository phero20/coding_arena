import { z } from "zod";

export const createSystemDesignTopicSchema = z.object({
  topic_id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int(),
  content: z.string().min(1),
});

export const updateSystemDesignTopicSchema = z.object({
  topic_id: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  order: z.number().int().optional(),
  content: z.string().min(1).optional(),
});

export const bulkReorderSystemDesignTopicsSchema = z.object({
  mappings: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int(),
    })
  ),
});
