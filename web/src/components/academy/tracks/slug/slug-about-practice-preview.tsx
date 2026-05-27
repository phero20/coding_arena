"use client";

import React from "react";
import { TrackConfigResponse } from "@/types/academy";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { PracticeProblemCard } from "@/components/academy/tracks/practice/practice-problem-card";

export const SlugAboutPracticePreview = ({ config, solvedExercises = [] }: { config: TrackConfigResponse, solvedExercises?: string[] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // We can show concept exercises too if there are no practice exercises, but usually there are practice.
  // Let's just combine them or pick practice.
  const practiceExercises = [...(config.exercises?.practice || []), ...(config.exercises?.concept || [])];
  
  if (practiceExercises.length === 0) return null;

  // Show up to 4 exercises for the preview
  const displayExercises = practiceExercises.slice(0, 4);

  const goToPracticeTab = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "practice");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto my-16 px-4 border-t-2 border-border/50 py-20">
      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Dive into <span className="text-primary">{config.language}</span> practice challenges
        </h2>
      </div>

      {/* Cards Grid Container with Gradient Fade */}
      <div className="relative overflow-hidden mb-10 pb-4">
        {/* We limit height to show a teaser, e.g., 280px */}
        <div className="relative h-[280px] overflow-hidden">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mx-auto w-full pt-1">
            {displayExercises.map((exercise) => (
              <PracticeProblemCard 
                key={exercise.slug} 
                exercise={exercise as any} 
                isSolved={solvedExercises.includes(exercise.slug)} 
              />
            ))}
          </div>
          
          {/* Gradient Overlay to fade the bottom */}
          <div className="absolute inset-x-0 bottom-0 h-68 bg-linear-to-t from-background via-background/60 to-transparent z-20 pointer-events-none" />
        </div>
      </div>

      {/* Simple CTA Link */}
      <div className="flex flex-col items-center justify-center pb-10 px-4">
        <Button 
          variant="link" 
          className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0"
          onClick={goToPracticeTab}
        >
          See all practice challenges for {config.language} <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
