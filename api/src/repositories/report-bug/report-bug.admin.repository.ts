import { db } from "../../db";
import { bugReports, type BugReport, type NewBugReport } from "../../db/schema";
import { eq, desc } from "drizzle-orm";

export class ReportBugAdminRepository {
  async findAll(): Promise<BugReport[]> {
    return await db.select().from(bugReports).orderBy(desc(bugReports.createdAt)).execute();
  }

  async create(data: NewBugReport): Promise<BugReport> {
    const [report] = await db.insert(bugReports).values(data).returning().execute();
    return report;
  }

  async update(id: string, data: Partial<BugReport>): Promise<BugReport | undefined> {
    const [updated] = await db
      .update(bugReports)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bugReports.id, id))
      .returning()
      .execute();
    return updated;
  }

  async delete(id: string): Promise<BugReport | undefined> {
    const [deleted] = await db
      .delete(bugReports)
      .where(eq(bugReports.id, id))
      .returning()
      .execute();
    return deleted;
  }
}
