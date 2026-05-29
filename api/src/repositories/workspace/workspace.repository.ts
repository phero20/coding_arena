import { db, schema } from "../../db";
import { eq, and, sql } from "drizzle-orm";
import type { Workspace, NewWorkspace, Diagram, NewDiagram } from "../../db/schema";
import { type ICradle } from "../../libs/awilix-container";

export interface IWorkspaceRepository {
  createWorkspace(workspace: NewWorkspace): Promise<Workspace>;
  findWorkspaceById(id: string): Promise<Workspace | null>;
  findWorkspacesByUserId(userId: string): Promise<Workspace[]>;
  findDefaultWorkspaceByUserId(userId: string): Promise<Workspace | null>;
  updateWorkspace(id: string, workspace: Partial<NewWorkspace>): Promise<Workspace>;
  deleteWorkspace(id: string): Promise<void>;

  createDiagram(diagram: NewDiagram): Promise<Diagram>;
  findDiagramById(id: string): Promise<Diagram | null>;
  findDiagramsByWorkspaceId(workspaceId: string): Promise<Diagram[]>;
  updateDiagram(id: string, diagram: Partial<NewDiagram>): Promise<Diagram>;
  deleteDiagram(id: string): Promise<void>;
}

export class WorkspaceRepository implements IWorkspaceRepository {
  constructor(cradle: ICradle) {}

  // Workspaces
  async createWorkspace(workspace: NewWorkspace): Promise<Workspace> {
    const [created] = await db.insert(schema.workspaces).values(workspace).returning();
    return created;
  }

  async findWorkspaceById(id: string): Promise<Workspace | null> {
    const [workspace] = await db
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, id))
      .limit(1);
    return workspace ?? null;
  }

  async findWorkspacesByUserId(userId: string): Promise<Workspace[]> {
    return await db
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.userId, userId))
      .orderBy(sql`${schema.workspaces.createdAt} ASC`);
  }

  async findDefaultWorkspaceByUserId(userId: string): Promise<Workspace | null> {
    const [workspace] = await db
      .select()
      .from(schema.workspaces)
      .where(
        and(
          eq(schema.workspaces.userId, userId),
          eq(schema.workspaces.isDefault, true)
        )
      )
      .limit(1);
    return workspace ?? null;
  }

  async updateWorkspace(id: string, workspace: Partial<NewWorkspace>): Promise<Workspace> {
    const [updated] = await db
      .update(schema.workspaces)
      .set({ ...workspace, updatedAt: new Date() })
      .where(eq(schema.workspaces.id, id))
      .returning();
    return updated;
  }

  async deleteWorkspace(id: string): Promise<void> {
    await db.delete(schema.workspaces).where(eq(schema.workspaces.id, id));
  }

  // Diagrams
  async createDiagram(diagram: NewDiagram): Promise<Diagram> {
    const [created] = await db.insert(schema.diagrams).values(diagram).returning();
    return created;
  }

  async findDiagramById(id: string): Promise<Diagram | null> {
    const [diagram] = await db
      .select()
      .from(schema.diagrams)
      .where(eq(schema.diagrams.id, id))
      .limit(1);
    return diagram ?? null;
  }

  async findDiagramsByWorkspaceId(workspaceId: string): Promise<Diagram[]> {
    return await db
      .select()
      .from(schema.diagrams)
      .where(eq(schema.diagrams.workspaceId, workspaceId))
      .orderBy(sql`${schema.diagrams.createdAt} DESC`);
  }

  async updateDiagram(id: string, diagram: Partial<NewDiagram>): Promise<Diagram> {
    const [updated] = await db
      .update(schema.diagrams)
      .set({ ...diagram, updatedAt: new Date() })
      .where(eq(schema.diagrams.id, id))
      .returning();
    return updated;
  }

  async deleteDiagram(id: string): Promise<void> {
    await db.delete(schema.diagrams).where(eq(schema.diagrams.id, id));
  }
}
