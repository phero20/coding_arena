"use client";


import { TrackConfigResponse } from "@/types/academy";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export const SlugAboutTab = ({ config }: { config: TrackConfigResponse }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalExercises = (config.exercises?.concept?.length || 0) + (config.exercises?.practice?.length || 0);
  const totalConcepts = config.exercises?.concept?.length || 0;

  const goToTab = (tab: "learn" | "practice") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full relative overflow-hidden py-16">
      {/* Subtle Background Hexagon Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
      />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Text Content */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-[54px] font-extrabold text-foreground leading-[1.1] tracking-tight">
              Master {config.language} with <br className="hidden md:block" /> Interactive Learning
            </h1>

           <p className="text-lg md:text-[20px] text-muted-foreground leading-relaxed max-w-150">
              Elevate your {config.language} skills through <span className="font-semibold text-foreground border-b-2 border-primary">{totalExercises} curated exercises</span> across <span className="font-semibold text-foreground border-b-2 border-primary">{totalConcepts} core concepts.</span> Master problem-solving with a structured learning path designed for modern developers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="px-8 h-14 text-base rounded-lg" onClick={() => goToTab("learn")}>
                Start Learning {config.language}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 h-14 text-base rounded-lg border-primary text-primary hover:bg-primary/10"
                onClick={() => goToTab("practice")}
              >
                Explore practice
              </Button>
            </div>
          </div>

          {/* Right Visual Content */}
          <div className="relative hidden lg:flex items-center justify-center h-full min-h-100">

            {/* The glowing central icon */}
            <div className="relative z-10 flex items-center justify-center w-64 h-64">
              <img
                src={config.icon_url}
                alt={config.language}
                className="w-full h-full object-contain relative z-20 transition-transform duration-500"
              />
            </div>

            {/* Colorful Floating Geometric Decorations */}
            
            {/* Yellow Circle - Top Left */}
            <div className="absolute top-12 left-16 drop-shadow-sm text-foreground">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <circle cx="12" cy="12" r="9" fill="#facc15" />
              </svg>
            </div>

            {/* Green Diamond - Middle Left */}
            <div className="absolute top-1/2 left-8 drop-shadow-sm text-foreground rotate-45">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" fill="#34d399" />
              </svg>
            </div>

            {/* Dashes - Top Left Center */}
            <div className="absolute top-32 left-32 flex gap-1.5 -rotate-45">
              <div className="w-4 h-1 bg-foreground rounded-full opacity-80"></div>
              <div className="w-4 h-1 bg-foreground rounded-full opacity-80"></div>
            </div>

            {/* Yellow Diamond - Top Right */}
            <div className="absolute top-16 right-20 drop-shadow-sm text-foreground -rotate-12">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" fill="#facc15" />
              </svg>
            </div>

            {/* Green Square - Middle Right */}
            <div className="absolute bottom-1/3 right-12 drop-shadow-sm text-foreground rotate-12">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" fill="#34d399" />
              </svg>
            </div>

            {/* Yellow Triangle - Bottom Center */}
            <div className="absolute bottom-12 right-1/3 drop-shadow-sm -rotate-12 text-foreground">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
                <polygon points="12 3 22 20 2 20" fill="#facc15" />
              </svg>
            </div>

            {/* Dotted squares - Top Left */}
            <div className="absolute top-8 left-1/3 grid grid-cols-3 gap-1.5 opacity-40">
              {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-foreground rounded-full"></div>)}
            </div>
            
            {/* Dotted squares - Middle Right */}
            <div className="absolute top-1/2 right-32 grid grid-cols-3 gap-1.5 opacity-40">
              {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-foreground rounded-full"></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
