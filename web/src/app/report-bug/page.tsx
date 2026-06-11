import { ReportBugForm } from "@/components/report-bug/ReportBugForm";

export const metadata = {
  title: "Report a Bug | SlaveCode",
  description: "Report an issue, bug, or provide feedback for SlaveCode.",
};

export default function ReportBugPage() {
  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden flex flex-col py-24 px-6 sm:px-12 lg:px-16">
      
      <div className="w-full relative z-10 flex-grow">
        <ReportBugForm />
      </div>
    </div>
  );
}
