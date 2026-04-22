import { z } from "zod";

/**
 * Validator for the compiler execution request
 */
export const ExecuteCodeSchema = z.object({
  compiler: z.string().min(1, "Compiler ID is required"),
  code: z.string().min(1, "Code content is required"),
  stdin: z.string().optional(),
  save: z.boolean().optional().default(false),
});

export type ExecuteCodeInput = z.infer<typeof ExecuteCodeSchema>;

/**
 * Service-level validation wrapper
 */
export const validateServiceInput = (schema: z.ZodSchema, data: any) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`);
  }
  return result.data;
};
