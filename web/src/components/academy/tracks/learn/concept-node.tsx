import React from 'react';
import { Card } from '@/components/ui/card';

import { CheckCircle2, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConceptNodeProps {
  label: string;
  id?: string;
  toneSeed?: string;
  progressData?: { status: "COMPLETED" | "IN_PROGRESS" | "LOCKED"; progress: number; total: number };
}

const tones = [
  {
    accent: 'text-yellow-400',
    hoverAccent: 'group-hover:text-yellow-400',
    chipBg: 'bg-yellow-500/15',
    chipBorder: 'border-yellow-400/50',
    ring: 'hover:ring-yellow-400/40',
    fill: '#facc15',
    icon: 'circle' as const,
  },
  {
    accent: 'text-emerald-400',
    hoverAccent: 'group-hover:text-emerald-400',
    chipBg: 'bg-emerald-500/15',
    chipBorder: 'border-emerald-400/50',
    ring: 'hover:ring-emerald-400/40',
    fill: '#34d399',
    icon: 'diamond' as const,
  },
  {
    accent: 'text-sky-400',
    hoverAccent: 'group-hover:text-sky-400',
    chipBg: 'bg-sky-500/15',
    chipBorder: 'border-sky-400/50',
    ring: 'hover:ring-sky-400/40',
    fill: '#60a5fa',
    icon: 'hex' as const,
  },
];

function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function ShapeGlyph({ icon, className, fill }: { icon: 'circle' | 'diamond' | 'hex'; className: string; fill: string }) {
  if (icon === 'circle') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" fill={fill} />
      </svg>
    );
  }

  if (icon === 'diamond') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" fill={fill} transform="rotate(45 12 12)" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
      <polygon points="12 2 21 7 21 17 12 22 3 17 3 7" fill={fill} />
    </svg>
  );
}

export function ConceptNode({ label, id, toneSeed, progressData }: ConceptNodeProps) {
  // Compute a 2-letter abbreviation
  const abbr = label
    ? label.substring(0, 2).charAt(0).toUpperCase() + label.substring(1, 2).toLowerCase()
    : 'Un';

  const tone = tones[hashSeed(toneSeed || label) % tones.length];
  
  const isCompleted = progressData?.status === "COMPLETED";
  const isInProgress = progressData?.status === "IN_PROGRESS";

  return (
    <Card
      id={id}
      className={cn(
        "group relative w-fit flex flex-row items-center gap-4 py-4 px-6 md:px-8 bg-card border transition-all duration-300 hover:-translate-y-0.5 hover:ring-1",
        tone.chipBorder,
        isCompleted && "bg-difficulty-easy/15 hover:ring-1 hover:ring-difficulty-easy"
      )}
    >
      <div className={`relative flex h-10 w-10 items-center justify-center shrink-0`}>
        <ShapeGlyph icon={tone.icon} fill={tone.fill} className="w-full" />
        <span className="absolute text-[10px] font-black uppercase tracking-wide text-slate-900">{abbr}</span>
      </div>

      <div className="pr-1 flex flex-col justify-center">
        <div className="flex items-center gap-2">

          <h3 className={cn("text-base md:text-lg font-semibold whitespace-nowrap tracking-tight", 
              tone.hoverAccent,
              isCompleted ? "text-difficulty-easy" : isInProgress ? tone.accent : "text-foreground")}>
            {label}
          </h3>
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-difficulty-easy shrink-0" />}
          {isInProgress && <CircleDashed className={cn("w-4 h-4 shrink-0", tone.accent)} />}
        </div>
        {progressData && progressData.total > 0 && (
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {progressData.progress} / {progressData.total} {progressData.total === 1 ? 'exercise' : 'exercises'}
          </p>
        )}
      </div>
    </Card>
  );
}
