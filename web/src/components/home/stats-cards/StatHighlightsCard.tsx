import React from "react";
import { Swords, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BentoCard } from "../feature-cards/shared";

const mockArenaMatches = [
  {
    id: "1",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    language: "C++",
    timeAgo: "2h ago",
    rank: 1,
    participants: 4,
  },
  {
    id: "2",
    title: "Longest Palindrome",
    difficulty: "Medium",
    language: "go",
    timeAgo: "5h ago",
    rank: 2,
    participants: 12,
  },
  {
    id: "3",
    title: "Two Sum",
    difficulty: "Easy",
    language: "rust",
    timeAgo: "1d ago",
    rank: 1,
    participants: 8,
  },
  {
    id: "4",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    language: "java",
    timeAgo: "2d ago",
    rank: 4,
    participants: 20,
  },
  {
    id: "5",
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    language: "rust",
    timeAgo: "3d ago",
    rank: 7,
    participants: 18,
  },
];

const difficultyClasses: Record<string, string> = {
  Easy: "text-difficulty-easy border-difficulty-easy bg-difficulty-easy/10",
  Medium: "text-difficulty-medium border-difficulty-medium bg-difficulty-medium/10",
  Hard: "text-difficulty-hard border-difficulty-hard bg-difficulty-hard/10",
};

export function StatHighlightsCard() {
  return (
    <BentoCard className="p-6 h-full flex flex-col gap-6">
      {/* Header - Matching ArenaHistoryTab.tsx and Dashboard Style */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Swords className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-tight text-foreground uppercase">
              Arena Records
            </h2>
            <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest leading-none mt-1">
              Match History
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="text-[8px] font-black h-5 opacity-60"
        >
          32 TOTAL
        </Badge>
      </div>

      {/* Match List - Mirroring ArenaMatchCard.tsx High-Fidelity */}
      <div className="flex-1 space-y-3 overflow-hidden pt-6">
        {mockArenaMatches.map((match) => (
          <div
            key={match.id}
            className="group p-3 relative overflow-hidden  border border-border/40 bg-card rounded-lg group hover:border-primary/40 transition-all cursor-default"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Match Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-[11px] truncate text-foreground group-hover:text-primary transition-colors">
                    {match.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[8px] font-black uppercase px-1.5 h-3.5",
                      difficultyClasses[match.difficulty],
                    )}
                  >
                    {match.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[8px] text-muted-foreground/40 font-black uppercase tracking-tighter">
                  <Clock size={10} />
                  <span>
                    {match.timeAgo} • {match.language}
                  </span>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="flex items-center gap-4 border-l border-border/10 pl-4">
                <div className="flex flex-col items-center">
                  <span className="text-[7px] font-black text-muted-foreground/40 tracking-widest uppercase mb-0.5">
                    Rank
                  </span>
                  <span className="text-xs text-primary font-black tabular-nums">
                    {match.rank}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-6 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                >
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
