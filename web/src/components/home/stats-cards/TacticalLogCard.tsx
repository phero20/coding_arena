import { Code2 } from "lucide-react";
import { BentoCard } from "../feature-cards/shared";
import { Badge } from "@/components/ui/badge";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { cn } from "@/lib/utils";

const mockSubmissions = [
  {
    id: 1,
    title: "Two Sum",
    time: "2 mins ago",
    lang: "Java",
    status: "Accepted",
  },
  {
    id: 2,
    title: "Longest Substring Without Repeating",
    time: "14 mins ago",
    lang: "Rust",
    status: "Wrong_Answer",
  },
  {
    id: 3,
    title: "Median of Two Sorted Arrays",
    time: "45 mins ago",
    lang: "Cpp",
    status: "Time_Limit_Exceeded",
  },
  {
    id: 4,
    title: "Add Two Numbers",
    time: "1 hour ago",
    lang: "Go",
    status: "Accepted",
  },
  {
    id: 5,
    title: "Longest Palindromic Substring",
    time: "2 hours ago",
    lang: "C#",
    status: "Accepted",
  },
];

export function TacticalLogCard() {
  return (
    <BentoCard className="p-6 space-y-4">
      {/* Header - Matching RecentActivities.tsx */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-difficulty-easy" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">Recent Submissions</span>
        </div>
      </div>

      {/* Feed - Matching Accordion Item Trigger Layout */}
      <div className="space-y-3">
        {mockSubmissions.map((sub) => (
          <div 
            key={sub.id} 
            className="flex items-center justify-between p-3 border border-border/40 bg-card rounded-lg group hover:border-primary/40 transition-all cursor-default"
          >
            <div className="flex flex-col min-w-0 pr-1">
              <span className="text-xs font-bold tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
                {sub.title}
              </span>
              <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter mt-1">
                {sub.time}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="hidden sm:flex text-[9px] uppercase font-bold py-0 h-5 border-border/40 bg-background/50">
                {sub.lang}
              </Badge>
              <div className="flex justify-end min-w-[80px]">
                <VerdictBadge verdict={sub.status} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-end pt-2">
        <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
          <span>Total Submissions</span>
          <span className="text-muted-foreground/60">1,242</span>
        </div>
      </div>
    </BentoCard>
  );
}
