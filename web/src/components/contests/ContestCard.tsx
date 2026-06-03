"use client";

import React from "react";
import { format, formatDistanceToNow, intervalToDuration } from "date-fns";
import { Calendar, Clock, ExternalLink, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Contest } from "@/types/contest";

interface ContestCardProps {
  contest: Contest;
}

const PlatformIcon = ({ platform, icon }: { platform: string; icon?: string | null }) => {
  if (icon) {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden">
        <img src={icon} alt={platform} className="h-full w-full object-contain" />
      </div>
    );
  }
  const initial = platform.charAt(0).toUpperCase() || "?";
  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary shadow-sm">
      {initial}
    </div>
  );
};

export const ContestCard: React.FC<ContestCardProps> = ({ contest }) => {
  const isOngoing = new Date(contest.startTime) <= new Date() && new Date(contest.endTime) >= new Date();
  const isUpcoming = new Date(contest.startTime) > new Date();

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-md">
      <div className="flex h-full flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <PlatformIcon platform={contest.platform} icon={contest.icon} />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {contest.platform}
            </span>
          </div>
          {isOngoing && (
            <Badge variant="destructive" className="animate-pulse shadow-sm">
              Live Now
            </Badge>
          )}
        </div>

        <h3 className="mb-5 line-clamp-3 text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
          {contest.title}
        </h3>

        <div className="mt-auto space-y-2 text-[13px] text-muted-foreground">
          <div className="flex items-center justify-between rounded-md bg-muted/50 p-2 px-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary/70" />
              <span className="font-medium">Starts</span>
            </div>
            <span className="text-foreground font-medium">{format(new Date(contest.startTime), "MMM dd, p")}</span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted/50 p-2 px-3">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-primary/70" />
              <span className="font-medium">Duration</span>
            </div>
            <span className="text-foreground font-medium">
              {(() => {
                const dur = intervalToDuration({ start: 0, end: contest.duration * 1000 });
                return `${dur.days ? `${dur.days}d ` : ""}${dur.hours || 0}h ${dur.minutes || 0}m`;
              })()}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted/30 p-2 px-3 border border-primary/10">
            <div className="flex items-center gap-2">
              <Timer className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold text-foreground">{isUpcoming ? "Starts In" : "Status"}</span>
            </div>
            <span className="font-bold text-primary">
              {isUpcoming ? formatDistanceToNow(new Date(contest.startTime)) : "Active Now"}
            </span>
          </div>

          <Button
            className="mt-4 w-full"
            asChild
          >
            <a href={contest.href} target="_blank" rel="noopener noreferrer">
              Register <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
};


