"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import type { PracticeProblemCardProps, PracticeProblemsSectionProps, PracticeProblemCardRenderProps } from "@/types/academy";
import { cn } from "@/lib/utils";
import usePracticeSorter from "./usePracticeSorter";
import { Input } from "@/components/ui/input";
import { Search, Check, CircleCheck } from "lucide-react";

import { tones } from "@/lib/tones";

function hashSeed(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 33 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function PracticeProblemCardContent({
  langSlug,
  slug,
  name,
  blurb,
  iconSrc,
  difficulty,
  completed,
}: PracticeProblemCardRenderProps) {
  const resolvedIconSrc = iconSrc ?? `/assets/practice-icon/${langSlug}/${slug}.svg`;
  const [imageSrc, setImageSrc] = useState(resolvedIconSrc);
  const tone = tones[hashSeed(`${langSlug}:${slug}`) % tones.length];

  useEffect(() => {
    setImageSrc(resolvedIconSrc);
  }, [resolvedIconSrc]);

  const handleImageError = () => {
    if (imageSrc !== "/assets/practice-icon/fallback.svg") {
      setImageSrc("/assets/practice-icon/fallback.svg");
    }
  };


  return (
    <Link href={`/academy/tracks/${langSlug}/exercises/${slug}`} className="block h-full">
      <Card className={cn(
        "group relative flex h-full min-h-32  overflow-hidden px-5 py-4 hover:ring-1",
        tone.chipBorder,
        completed && "bg-difficulty-easy/10 hover:ring-1 hover:ring-difficulty-easy"
      )}>
        <div className="relative flex h-full w-full items-start gap-4">
          <div className="relative mt-1 shrink-0">
            <img width={100} height={100}
              src={imageSrc}
              onError={handleImageError}
              alt={name}
              className="h-16 w-16 object-contain"
            />
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <CardTitle className={cn("flex gap-2 truncate text-base font-semibold leading-tight hover:underline cursor-pointer text-foreground", tone.hoverAccent,completed && "text-difficulty-easy")}>
              {name} {completed && <Check className="w-4 h-4 text-difficulty-easy" />}
            </CardTitle>
            {typeof difficulty === 'number' ? (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className={cn("rounded-full border px-3 py-1 font-medium", tone.chipBg, tone.chipBorder, tone.accent)}>
                  Level {difficulty}
                </Badge>
                {completed && (
                  <Badge variant="outline" className={cn("rounded-full border px-3 py-1 font-medium", tone.chipBg, tone.chipBorder, "border-difficulty-easy ring-1 ring-difficulty-easy")}>
                    <CircleCheck className="w-4 h-4 mr-2 text-difficulty-easy" /> 
                    Solved
                  </Badge>
                )}
              </div>
            ) : null}

            <p className="mt-2 line-clamp-2 text-sm leading-snug text-muted-foreground">
              {blurb?.replace(/exercism's/gi, "SlaveCode's").replace(/exercism/gi, "SlaveCode")}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function PracticeProblemCard(props: PracticeProblemCardProps & { isSolved?: boolean }) {
  const params = useParams<{ slug?: string }>();
  const langSlug = params?.slug ?? "";
  const exercise = props.exercise;

  return (
    <div className={cn("block", props.className)}>
      <PracticeProblemCardContent
        langSlug={langSlug}
        slug={exercise.slug}
        name={exercise.name}
        blurb={exercise.blurb}
        iconSrc={exercise.iconSrc}
        difficulty={exercise.difficulty}
        practices={exercise.practices}
        prerequisites={exercise.prerequisites}
        completed={props.isSolved}
      />
    </div>
  );
}

export function PracticeProblemsSection({ exercises, solvedExercises = [], className }: PracticeProblemsSectionProps) {
  // Accept either the raw PracticeExercise[] or the full { concept, practice } object
  // Always pass a TrackExercises shape to the sorter; it supports an optional search `query`.
  const [query, setQuery] = useState("");
  const trackExercises = Array.isArray(exercises) ? { practice: exercises } : exercises;
  const resolvedExercises = usePracticeSorter(trackExercises as any, { query });

  return (
    <section className={cn("space-y-6", className)}>
      <div className="space-y-1">
        <h3 className="text-2xl font-semibold tracking-tight text-foreground">Practice Challenges</h3>
        <p className="text-sm text-muted-foreground mb-4">Pick a problem and open it and solve it.</p>

        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder="Search problems by name"
            value={query}
            onChange={(e: any) => setQuery(e.target.value)}
            className="pl-9 bg-card/40 border-border focus-visible:ring-primary"
          />
        </div>
      </div>

      {resolvedExercises?.length ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {resolvedExercises.map((exercise: any) => (
            <PracticeProblemCard key={exercise.slug} exercise={exercise} isSolved={solvedExercises.includes(exercise.slug)} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          <p>No practice challenges are available for this track yet.</p>
        </div>
      )}
    </section>
  );
}
