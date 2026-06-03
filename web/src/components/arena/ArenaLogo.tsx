import React from "react";
import { cn } from "@/lib/utils";
import { Swords } from "lucide-react";
import { tones } from "@/lib/tones";

export function ArenaLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="arena-hex-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.15" />
          </filter>
        </defs>

        <path
          d="M50 4.8 C51.7 4.8 53.1 5.5 54.2 6.6 L85.5 26 C87.7 27.4 89.1 30 89.1 32.8 L89.1 67.2 C89.1 70 87.7 72.6 85.5 74 L54.2 93.4 C53.1 94.5 51.7 95.2 50 95.2 C48.3 95.2 46.9 94.5 45.8 93.4 L14.5 74 C12.3 72.6 10.9 70 10.9 67.2 L10.9 32.8 C10.9 30 12.3 27.4 14.5 26 L45.8 6.6 C46.9 5.5 48.3 4.8 50 4.8 Z"
          fill="#ffffff"
          stroke={tones[0].fill}
          strokeWidth="4"
          strokeLinejoin="round"
          filter="url(#arena-hex-shadow)"
        />
      </svg>
      
      {/* Center Swords Icon */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <Swords 
          className="w-[45%] h-[45%]" 
          strokeWidth={2.5} 
          style={{ color: tones[2].fill, fill: tones[1].fill }}
        />
      </div>
    </div>
  );
}
