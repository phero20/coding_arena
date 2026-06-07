"use client";


import { TrackConfigResponse } from "@/types/academy";

export const SlugHeader = ({ config }: { config: TrackConfigResponse }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10 py-6">
      {/* Left side: Icon and Title */}
      <div className="flex items-center gap-3 shrink-0">
        <img
          src={config.icon_url}
          alt={config.language}
          className="w-16 object-contain relative z-10"
        />

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          {config.language}
        </h1>
      </div>

      {/* Right side: Blurb */}
      {config.blurb && (
        <div className="flex-1 max-w-3xl pt-2 lg:pt-0">
          <p className="text-muted-foreground text-[15px] sm:text-base leading-relaxed border-l-[3px] border-border/70  pl-5 py-0.5">
            {config.blurb}
          </p>
        </div>
      )}
    </div>
  );
};
