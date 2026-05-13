"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Trophy, 
  Users, 
  Code, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Award,
  ArrowRight,
  Clock2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ArenaMatch, ArenaPlayerResult } from "@/types/arena";
import { Button } from "@/components/ui/button";

interface ArenaMatchCardProps {
  match: ArenaMatch;
  currentUserId: string;
  onSelect?: (match: ArenaMatch) => void;
}


const difficultyClasses: Record<string, string> = {
  Easy: "text-difficulty-easy border-difficulty-easy bg-difficulty-easy",
  Medium: "text-difficulty-medium border-difficulty-medium bg-difficulty-medium",
  Hard: "text-difficulty-hard border-difficulty-hard bg-difficulty-hard",
};

export const ArenaMatchCard: React.FC<ArenaMatchCardProps> = ({
  match,
  currentUserId,
  onSelect,
}) => {
  const myResult = match.players.find((p) => p.userId === currentUserId);

  const formattedDate = formatDistanceToNow(new Date(match.startedAt), { addSuffix: true });

  return (
    <Card
      onClick={() => onSelect?.(match)}
      className="group cursor-pointer relative overflow-hidden"
    >
      <CardContent className="py-4 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Match Info Sector */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-4">
              <h3 className="font-bold text-sm tracking-tight truncate text-foreground/90 uppercase">
                {match.problemTitle || match.problemSlug || "Arena Match"}
              </h3>
              {match.difficulty && (
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      difficultyClasses[match.difficulty],
                    )}
                  >
                    {match.difficulty}
                  </Badge>
                  <Badge className="uppercase">{match.language}</Badge>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest">
              <span className="flex items-center gap-1.5 shrink-0">
                <Clock className="h-3 w-3 opacity-60" />
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Performance Sector */}
          <div className="flex items-center gap-4 sm:gap-8 shrink-0 border-l border-border/10 pl-4 sm:pl-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center gap-1 text-[8px] font-black text-muted-foreground tracking-widest uppercase mb-1">
                <Trophy className="h-2.5 w-2.5" />
                <span className="hidden sm:inline">RANK</span>
              </div>
              <span className="text-xs sm:text-base text-primary font-black tabular-nums leading-none">
                {myResult?.submissionOrder || "--"}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center gap-1 text-[8px] font-black text-muted-foreground tracking-widest uppercase mb-1 opacity-70">
                <Users className="h-2.5 w-2.5" />
                <span className="hidden sm:inline">PARTICIPANTS</span>
              </div>
              <span className="text-xs sm:text-base font-black tabular-nums leading-none">
                {match.players.length}
              </span>
            </div>
            <Button size="icon">
              <ArrowRight />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
