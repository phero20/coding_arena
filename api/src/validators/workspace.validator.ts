import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 character").max(100),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 character").max(100),
});

export const createDiagramSchema = z.object({
  title: z.string().min(1, "Title must be at least 1 character").max(100),
});

export const updateDiagramSchema = z.object({
  title: z.string().min(1, "Title must be at least 1 character").max(100).optional(),
  documentState: z.any().optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type CreateDiagramInput = z.infer<typeof createDiagramSchema>;
export type UpdateDiagramInput = z.infer<typeof updateDiagramSchema>;
