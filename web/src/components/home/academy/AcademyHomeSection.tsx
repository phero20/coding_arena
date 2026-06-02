"use client";

import React from "react";
import Link from "next/link";
import { Dumbbell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TracksHeader } from "@/components/academy/tracks/tracks-header";
import { Card } from "@/components/ui/card";

// Mock data representing the real tracks
const MOCK_TRACKS = [
  { 
    slug: "gleam", 
    title: "Gleam", 
    num_exercises: 142, 
    icon_url: "https://assets.exercism.org/tracks/gleam.svg", 
    tags: ["Compiled", "Declarative", "Functional"] 
  },
  { 
    slug: "go", 
    title: "Go", 
    num_exercises: 98, 
    icon_url: "https://assets.exercism.org/tracks/go.svg", 
    tags: ["Compiler", "Imperative", "Procedural"] 
  },
  { 
    slug: "groovy", 
    title: "Groovy", 
    num_exercises: 115, 
    icon_url: "https://assets.exercism.org/tracks/groovy.svg", 
    tags: ["Compiled", "Declarative", "Functional"] 
  },
  { 
    slug: "haskell", 
    title: "Haskell", 
    num_exercises: 98, 
    icon_url: "https://assets.exercism.org/tracks/haskell.svg", 
        tags: ["Declarative", "Functional","Static"] 

  },
  {
    slug: "idris",
    title: "Idris",
    num_exercises: 98,
    icon_url: "https://assets.exercism.org/tracks/idris.svg",
      tags: ["Compiled", "Declarative", "Functional"] 

  },
  {
    slug: "java",
    title: "Java",
    num_exercises: 98,
    icon_url: "https://assets.exercism.org/tracks/java.svg",
        tags: ["Compiled","Functional","Imperative"] 

  },
  {
    slug: "javascript",
    title: "Javascript",
    num_exercises: 98,
    icon_url: "https://assets.exercism.org/tracks/javascript.svg",
            tags: ["Interpreted","Declarative","Functional"] 

  },
  {
    slug: "jq",
    title: "jq",
    num_exercises: 98,
    icon_url: "https://assets.exercism.org/tracks/jq.svg",
    tags: ["Functional", "Linux", "macOs"]
  },
];

const MockTrackCard = ({ track }: { track: typeof MOCK_TRACKS[0] }) => (
  <Card className="group flex flex-row items-center gap-4 overflow-hidden p-4 transition-all duration-300 hover:border-primary/50 w-full">
    {/* Icon Side */}
    <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center p-1.5">
      <img
        src={track.icon_url}
        alt={`${track.title} icon`}
        className="h-full w-full object-contain drop-shadow-sm"
        loading="lazy"
      />
    </div>

    {/* Content Side */}
    <div className="flex flex-1 flex-col gap-1 min-w-0">
      <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
        {track.title}
      </h3>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Dumbbell className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{track.num_exercises} exercises</span>
      </div>

      {/* Tags */}
      <div className="mt-1 flex flex-wrap gap-1.5 hidden sm:flex">
        {track.tags.slice(0, 2).map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="bg-secondary/60 text-[10px] px-1.5 py-0 font-medium text-secondary-foreground truncate"
          >
            {tag}
          </Badge>
        ))}
        <span className="text-[10px]">more+</span>
      </div>
    </div>
  </Card>
);

export const AcademyHomeSection = () => {
  const totalTracks = 82; // Hardcoded for home page impact

  return (
    <section className="relative w-full overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-2 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 md:gap-12 items-center">
          
          {/* Left Side: The Hook & Content */}
          <div className="flex flex-col items-start text-left max-w-2xl">
            
            {/* The Hexagon Wave and Header (Using real TracksHeader) */}
            <div className="mb-8 w-full  origin-left">
              <TracksHeader 
                totalTracks={totalTracks} 
                sampleTracks={MOCK_TRACKS as any} 
              />
            </div>
          </div>

          {/* Right Side: Visuals (Track Cards) */}
          <div className="relative w-full h-auto min-h-125 flex flex-col justify-center gap-8 ">

            {/* The Track Cards Grid */}
            <div className="relative z-10 w-full max-w-2xl mx-auto overflow-hidden pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pointer-events-none opacity-90 px-1">
                {MOCK_TRACKS.slice(0, 6).map((track, i) => (
                  <div 
                    key={track.slug} 
                    className={cn(
                      "transition-all duration-500 hover:scale-[1.02]",
                      i >= 3 ? "hidden sm:block" : "block"
                    )}
                    style={{ 
                      opacity: 1 - (Math.floor(i / 2) * 0.25) // Slight fade out for lower rows
                    }}
                  >
                    <MockTrackCard track={track} />
                  </div>
                ))}
              </div>
              
              {/* Fade out bottom overlay */}
              <div className="absolute inset-x-0 bottom-0 h-72 bg-linear-to-t from-background via-background/40 to-background/10 z-20 pointer-events-none" />
            </div>

            {/* CTA Button below grid */}
            <div className="flex flex-col items-center justify-center relative z-30">
              <Button 
                variant="link" 
                className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0"
                asChild
              >
                <Link href="/academy">
                  See all {totalTracks} languages <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
