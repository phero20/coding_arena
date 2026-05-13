"use client";

import React from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SlidingNumber } from "@/components/arena/MatchTimer";
import { Card } from "@/components/ui/card";

export const PracticeStopwatch = () => {
  const [time, setTime] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleToggle = () => setIsRunning(!isRunning);
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <Card className="flex items-center gap-1 p-0.5 rounded-lg">
      {/* Timer Display */}
      <div className="flex items-center gap-2 pl-3 py-1">
        <Clock className={cn(
          "size-3.5 transition-colors duration-500",
          isRunning ? "text-primary" : "text-muted-foreground"
        )} />
        <div className="flex items-center font-mono text-md font-black tracking-tighter text-foreground/90 w-12 justify-center">
          <SlidingNumber value={minutes} padStart={true} />
          <span className="mx-0.5 text-primary/40 font-sans">:</span>
          <SlidingNumber value={seconds} padStart={true} />
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={handleToggle}
          title={isRunning ? "Pause" : "Start"}
        >
          {isRunning ? (
            <Pause className="size-3.5 fill-current" />
          ) : (
            <Play className="size-3.5 fill-current ml-0.5" />
          )}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          className="size-8 bg-transparent"
          onClick={handleReset}
          title="Reset"
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>
    </Card>
  );
};
