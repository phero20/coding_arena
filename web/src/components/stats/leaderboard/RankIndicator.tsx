import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface RankIndicatorProps {
  rank: number;
}

export const RankIndicator: React.FC<RankIndicatorProps> = ({ rank }) => {
  if (rank <= 3) {
    const themes = {
      1: "bg-rank-1-badge text-rank-1 border-rank-1",
      2: "bg-rank-2-badge text-rank-2 border-rank-2",
      3: "bg-rank-3-badge text-rank-3 border-rank-3",
    }[rank as 1 | 2 | 3];

    return (
      <Badge
        variant="outline"
        className={cn(
          "inline-flex items-center justify-center w-7 h-7 border text-[11px] font-black tracking-tighter",
          themes
        )}>
        {rank}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="inline-flex items-center justify-center w-7 h-7 border text-[11px] font-black tracking-tighter">
      {rank}
    </Badge>
  );
};
