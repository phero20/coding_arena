"use client";

import React from "react";
import Link from "next/link";
import { Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ArenaSelectionBannerProps } from "@/types/component.types";

export const ArenaSelectionBanner: React.FC<ArenaSelectionBannerProps> = ({
  roomId,
}) => {
  return (
    <div className="flex justify-center w-full">
      <Card className="w-full max-w-2xl flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Swords className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight uppercase opacity-90 text-primary">
              Arena Selection Mode
            </h3>
            <p className="text-muted-foreground text-[8px] md:text-xs font-bold uppercase tracking-widest opacity-60">
              Choose a problem to host your battle.
            </p>
          </div>
        </div>
        <Link href={`/arena/${roomId}`}>
          <Button variant="destructive" size="sm" className="h-9 px-4">
            Cancel
          </Button>
        </Link>
      </Card>
    </div>
  );
};
