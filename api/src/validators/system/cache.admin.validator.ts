import { z } from "zod";

export const getCacheKeysSchema = z.object({
  cursor: z.string().optional().default("0"),
  pattern: z.string().optional().default("*"),
  count: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 5000, {
      message: "Count must be a number between 1 and 5000",
    })
    .optional()
    .default(100),
});

export const cacheKeyParamSchema = z.object({
  key: z.string().min(1, "Key is required"),
});

// A schema to parse standard query params when it comes from the URL
export type GetCacheKeysQuery = z.infer<typeof getCacheKeysSchema>;
