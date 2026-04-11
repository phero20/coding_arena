"use client";

import React, { useState, useEffect, useId } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MotionValue,
  motion,
  useSpring,
  useTransform,
  motionValue,
} from "framer-motion";
import useMeasure from "react-use-measure";

const TRANSITION = {
  type: "spring" as const,
  stiffness: 280,
  damping: 18,
  mass: 0.3,
};

function Digit({ value, place }: { value: number; place: number }) {
  const valueRoundedToPlace = Math.floor(value / place) % 10;
  const initial = motionValue(valueRoundedToPlace);
  const animatedValue = useSpring(initial, TRANSITION);

  useEffect(() => {
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
  const uniqueId = useId();
  const [ref, bounds] = useMeasure();

  const y = useTransform(mv, (latest) => {
    if (!bounds.height) return 0;
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;
    let memo = offset * bounds.height;

    if (offset > 5) {
      memo -= 10 * bounds.height;
    }

    return memo;
  });

  // don't render the animated number until we know the height
  if (!bounds.height) {
    return (
      <span ref={ref} className="invisible absolute">
        {number}
      </span>
    );
  }

  return (
    <motion.span
      style={{ y }}
      layoutId={`${uniqueId}-${number}`}
      className="absolute inset-0 flex items-center justify-center"
      transition={TRANSITION}
      ref={ref}
    >
      {number}
    </motion.span>
  );
}

type SlidingNumberProps = {
  value: number;
  padStart?: boolean;
};

function SlidingNumber({ value, padStart = false }: SlidingNumberProps) {
  const absValue = Math.abs(value);
  // Ensure we consistently use 2 digits for times smaller than 100
  const stringValue = padStart ? String(absValue).padStart(2, "0") : String(absValue);
  const integerDigits = stringValue.split("");
  const integerPlaces = integerDigits.map((_, i) =>
    Math.pow(10, integerDigits.length - i - 1)
  );

  return (
    <div className="flex items-center">
      {value < 0 && "-"}
      {integerDigits.map((_, index) => (
        <Digit
          key={`pos-${integerPlaces[index]}-${index}`}
          value={absValue}
          place={integerPlaces[index]}
        />
      ))}
    </div>
  );
}

interface MatchTimerProps {
  endTime: number | string;
}

export const MatchTimer: React.FC<MatchTimerProps> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const end = typeof endTime === "number" ? endTime : new Date(endTime).getTime();

    const calculateTimeLeft = () => {
      const now = Date.now();
      return Math.max(0, Math.floor((end - now) / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (!hasMounted) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-sm font-bold border bg-card border-border/50 text-foreground opacity-50">
        <Clock className="w-4 h-4" />
        <span>--:--</span>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isWarning = timeLeft > 0 && timeLeft <= 60; // Last 60 seconds
  const isDanger = timeLeft > 0 && timeLeft <= 10; // Last 10 seconds

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-[15px] font-bold border-2 transition-all duration-200",
      "shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-default",
      timeLeft === 0 ? "bg-destructive text-destructive-foreground border-destructive-foreground/50" :
      isDanger ? "bg-destructive/15 text-destructive border-destructive" :
      isWarning ? "bg-accent text-accent-foreground border-foreground/30" :
      "bg-card border-border text-foreground"
    )}>
      <Clock className={cn("w-[18px] h-[18px]", isDanger && "text-destructive")} />
      
      <div className="flex items-center tracking-tight">
        <SlidingNumber value={minutes} padStart={true} />
        <span className={cn("mx-0.5 opacity-70", isDanger ? "text-destructive" : "text-muted-foreground")}>:</span>
        <SlidingNumber value={seconds} padStart={true} />
      </div>
    </div>
  );
};
