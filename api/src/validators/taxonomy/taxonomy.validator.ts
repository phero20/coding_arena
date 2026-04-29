import { z } from 'zod';

/**
 * Validator for creating a category node in the taxonomy tree.
 */
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case'),
  parentId: z.string().uuid().nullable().optional(),
  description: z.string().optional(),
  order: z.number().int().optional().default(0),
});

/**
 * Validator for mapping a problem to a category.
 */
export const mapProblemSchema = z.object({
  categoryId: z.string().uuid('categoryId must be a valid UUID'),
  problemId: z.string().min(1, 'Problem ID is required'),
  order: z.number().int().optional().default(0),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type MapProblemInput = z.infer<typeof mapProblemSchema>;
