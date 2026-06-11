"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ArenaSelectionBannerProps } from "@/types/component.types";
import { ArenaLogo } from "../arena/ArenaLogo";
import { Separator } from "../ui/separator";
import { Bug } from "lucide-react";

export const ArenaSelectionBanner: React.FC<ArenaSelectionBannerProps> = ({
  roomId,
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full mb-8">
      <Card className="w-full max-w-2xl flex items-center justify-between pb-4 border-none bg-transparent shadow-none">
        <div className="flex items-center gap-1">
          <div className="w-10 h-10 shrink-0">
            <ArenaLogo className="w-full h-full hover:scale-105 transition-transform duration-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight opacity-90 text-primary">
              Arena Selection Mode
            </h3>
            <p className="text-muted-foreground text-[8px] md:text-xs font-bold  tracking-wider opacity-60">
              Choose a problem to host the match.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/arena${roomId ? "/" + roomId : ""}`}>
            <Button variant="destructive" size="sm" className="h-9 px-4">
              Cancel
            </Button>
          </Link>
          <Link href="/report-bug">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8  text-difficulty-medium transition-colors"
              title="Report an Issue"
            >
              <Bug className="size-4" />
            </Button>
          </Link>
        </div>
      </Card>
      <Separator className="max-w-2xl" />
    </div>
  );
};
