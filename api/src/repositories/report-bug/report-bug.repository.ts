import { db } from "../../db";
import { bugReports, type NewBugReport, type BugReport } from "../../db/schema";

export interface IReportBugRepository {
  createReport(data: NewBugReport): Promise<BugReport>;
}

export class ReportBugRepository implements IReportBugRepository {
  async createReport(data: NewBugReport): Promise<BugReport> {
    const [report] = await db.insert(bugReports).values(data).returning().execute();
    return report;
  }
}
