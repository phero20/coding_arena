"use client";

import React, { useEffect, useState } from "react";
import { Duration, format, intervalToDuration } from "date-fns";
import { Calendar, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Contest } from "@/types/contest";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, useSpring, useTransform, MotionValue } from "framer-motion";
import useMeasure from "react-use-measure";

const TRANSITION = {
  type: "spring" as const,
  stiffness: 280,
  damping: 18,
  mass: 0.3,
};

function Digit({ value, place }: { value: number; place: number }) {
  const valueRoundedToPlace = Math.floor(value / place) % 10;
  const initial = valueRoundedToPlace;
  const animatedValue = useSpring(initial, TRANSITION);

  React.useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div className="relative inline-block w-[1ch] overflow-x-visible overflow-y-clip leading-none tabular-nums">
      <div className="invisible">0</div>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} />
      ))}
    </div>
  );
}

function Number({ mv, number }: { mv: MotionValue<number>; number: number }) {
  const uniqueId = React.useId();
  const [ref, bounds] = useMeasure();

  const y = useTransform(mv, (latest) => {
    if (!bounds.height) return 0;
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;
    let memo = offset * bounds.height;
    if (offset > 5) memo -= 10 * bounds.height;
    return memo;
  });

  if (!bounds.height) return <span ref={ref} className="invisible absolute">{number}</span>;

  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center"
      ref={ref}
    >
      {number}
    </motion.span>
  );
}

function SlidingNumber({ value, padStart = false, label }: { value: number; padStart?: boolean; label: string }) {
  const absValue = Math.abs(value);
  const stringValue = padStart ? String(absValue).padStart(2, "0") : String(absValue);
  const integerDigits = stringValue.split("");
  const integerPlaces = integerDigits.map((_, i) => Math.pow(10, integerDigits.length - i - 1));

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center text-2xl font-black tracking-tighter sm:text-4xl">
        {integerDigits.map((_, index) => (
          <Digit key={index} value={absValue} place={integerPlaces[index]} />
        ))}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">{label}</span>
    </div>
  );
}

const PlatformIcon = ({ platform, icon, size = "md" }: { platform: string; icon?: string | null; size?: "md" | "lg" }) => {
  const dims = size === "lg" ? "h-12 w-12 md:h-16 md:w-16" : "h-6 w-6";
  if (icon) {
    return (
      <div className={`flex shrink-0 items-center justify-center overflow-hidden`}>
        <img width={100} height={100} src={icon} alt={platform} className="h-full w-full object-contain" />
      </div>
    );
  }
  const initial = platform.charAt(0).toUpperCase() || "?";
  return (
    <Card className={`flex shrink-0 items-center justify-center font-bold text-primary shadow-sm ${dims} ${size === "lg" ? "text-2xl" : "text-xs"}`}>
      {initial}
    </Card>
  );
};

interface ContestHeroProps {
  featuredContest: Contest | null;
}

export const ContestHero: React.FC<ContestHeroProps> = ({ featuredContest }) => {
  const [duration, setDuration] = useState<Duration | null>(null);

  useEffect(() => {
    if (!featuredContest) return;
    const timer = setInterval(() => {
      const start = new Date(featuredContest.startTime);
      const now = new Date();
      if (start <= now) {
        setDuration(null);
        clearInterval(timer);
        return;
      }
      setDuration(intervalToDuration({ start: now, end: start }));
    }, 1000);
    return () => clearInterval(timer);
  }, [featuredContest]);

  if (!featuredContest) return null;

  const isOngoing = new Date(featuredContest.startTime) <= new Date() && new Date(featuredContest.endTime) >= new Date();

  return (
    <Card className="relative mb-10 overflow-hidden border-border bg-transparent shadow-none border-none">
      <CardContent className="relative z-10 flex flex-col items-start gap-6 p-5 sm:p-6 lg:flex-row lg:items-start">
        <div className="flex w-full items-start gap-5">
          {/* Platform Icon and Info side-by-side on mobile */}
          <PlatformIcon
            platform={featuredContest.platform}
            icon={featuredContest.icon}
            size="lg"
          />

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="default"
                className="bg-primary text-primary-foreground px-3 text-[10px] font-bold uppercase tracking-widest"
              >
                {featuredContest.platform}
              </Badge>
              {isOngoing && (
                <Badge variant="destructive" className="uppercase text-[10px] tracking-wider font-bold">
                  Live
                </Badge>
              )}
            </div>

          <h2 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl md:text-3xl">
            {featuredContest.title}
          </h2>

          <div className="flex flex-wrap items-center gap-8 text-[13px] font-bold">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col ">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                  Starts
                </span>
                <span className="text-foreground font-bold tracking-tight">
                  {format(
                    new Date(featuredContest.startTime),
                    "EEE, MMM dd • p",
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col ">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                  Duration
                </span>
                <span className="text-foreground font-bold tracking-tight">
                  {(() => {
                    const dur = intervalToDuration({
                      start: 0,
                      end: featuredContest.duration * 1000,
                    });
                    return `${dur.days ? `${dur.days}d ` : ""}${dur.hours || 0}h ${dur.minutes || 0}m`;
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Countdown Section */}
        <Card className="flex w-full shrink-0 flex-col gap-4 bg-card p-5 sm:p-6 lg:w-auto shadow-none">
          <div className="flex items-center justify-between lg:justify-center lg:gap-6">
            <SlidingNumber
              value={duration?.days || 0}
              padStart={true}
              label="Days"
            />
            <span className="mb-4 text-xl font-black text-muted-foreground/20">
              :
            </span>
            <SlidingNumber
              value={duration?.hours || 0}
              padStart={true}
              label="Hrs"
            />
            <span className="mb-4 text-xl font-black text-muted-foreground/20">
              :
            </span>
            <SlidingNumber
              value={duration?.minutes || 0}
              padStart={true}
              label="Mins"
            />
            <span className="mb-4 text-xl font-black text-muted-foreground/20">
              :
            </span>
            <SlidingNumber
              value={duration?.seconds || 0}
              padStart={true}
              label="Secs"
            />
          </div>

          <Button
            className="h-11 w-full shadow-none text-xs font-bold uppercase tracking-widest transition-all"
            size="sm"
            asChild
          >
            <a
              href={featuredContest.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Contest <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        </Card>
      </CardContent>
    </Card>
  );
};