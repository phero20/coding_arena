"use client";

import type { Track } from "@/types/academy";
import Link from "next/link";

interface TracksHeaderProps {
  totalTracks: number;
  sampleTracks: Track[];
}

export function TracksHeader({ totalTracks, sampleTracks }: TracksHeaderProps) {
  return (
    <section className="flex flex-col items-center justify-center text-center space-y-12">
      {/* Overlapping Hexagon Icons */}
      {sampleTracks.length > 0 && (
        <div className="flex items-center justify-center -space-x-3 sm:-space-x-4">
          {sampleTracks.slice(0, 8).map((track, i) => (
            <Link 
              href={`/academy/tracks/${track.slug}`}
              key={track.slug}
              className="relative transition-transform cursor-pointer"
              style={{ 
                zIndex: 10 - Math.floor(Math.abs(3.5 - i)),
                transform: `translateY(${Math.pow(i - 3.5, 2) * 2}px)`
              }}
              title={track.title}
            >
              <img
                src={track.icon_url}
                alt={track.title}
                className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-sm"
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      )}

      {/* Typography */}
      <div className="space-y-4 max-w-3xl flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
          <span className="text-primary">{totalTracks} languages</span> for you to master
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
          Master your preferred programming languages through curated, 
          structured learning tracks designed for deliberate practice.
        </p>
      </div>
    </section>
  );
}
