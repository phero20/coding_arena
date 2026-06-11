import { reportBugMeta } from "@/meta/report-bug/static";

export const metadata = reportBugMeta;

export default function ReportBugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
