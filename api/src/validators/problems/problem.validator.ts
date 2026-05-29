import { z } from "zod";

/**
 * Schema for creating or updating a Problem.
 */
export const createProblemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  problem_id: z.string().min(1, "Problem ID is required"),
  problem_slug: z.string().min(1, "Problem Slug is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  description: z.string().min(1, "Description is required"),
  topics: z.array(z.string()).optional(),
  category: z.string().optional(),
<<<<<<< HEAD
=======
  problem_type: z.enum(["function", "class", "interactive"]).default("function"),
  function_signature: z.object({
    name: z.string().min(1, "Function name is required"),
    return_type: z.string().min(1, "Return type is required"),
    params: z.array(z.object({
      name: z.string().min(1, "Param name is required"),
      type: z.string().min(1, "Param type is required"),
    })).default([]),
  }).optional(),
  class_signature: z.object({
    class_name: z.string().min(1, "Class name is required"),
    constructor_params: z.array(z.object({
      name: z.string().min(1, "Param name is required"),
      type: z.string().min(1, "Param type is required"),
    })).default([]),
    methods: z.array(z.object({
      name: z.string().min(1, "Method name is required"),
      return_type: z.string().min(1, "Return type is required"),
      params: z.array(z.object({
        name: z.string().min(1, "Param name is required"),
        type: z.string().min(1, "Param type is required"),
      })).default([]),
    })).default([]),
  }).optional(),
  judging_policy: z.object({
    comparator_mode: z.enum(["strict", "problem_specific"]).optional(),
    multi_answer: z.boolean().optional(),
    validation_policy: z.string().optional(),
    output_order: z.enum(["strict", "any_order"]).optional(),
    audit_hints: z.array(z.string()).optional(),
  }).optional(),
  examples: z.array(z.object({
    example_num: z.number(),
    example_text: z.string(),
    images: z.array(z.string()).optional(),
  })).optional(),
  constraints: z.array(z.string()).optional(),
  hints: z.array(z.string()).optional(),
  follow_ups: z.array(z.string()).optional(),
  code_snippets: z.record(z.string(), z.string()).optional(),
  solutions: z.string().optional(),
>>>>>>> prod-deploy
});
export type CreateProblemInput = z.infer<typeof createProblemSchema>;
