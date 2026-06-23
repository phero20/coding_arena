"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Xarrow, { Xwrapper } from "react-xarrows";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

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

// Mock Data for Practice Cards
const MOCK_PRACTICE_CARDS = [
  {
    title: "Hello World",
    description: "SlaveCode's classic introductory exercise. Just say \"Hello, World!\".",
    icon_url: "https://raw.githubusercontent.com/exercism/website-icons/main/exercises/hello-world.svg",
    toneIndex: 0,
  },
  {
    title: "Cook Your Lasagna",
    description: "Learn about the basics of Java by following a lasagna recipe.",
    icon_url: "https://raw.githubusercontent.com/exercism/website-icons/main/exercises/lasagna.svg",
    toneIndex: 1,
  },
  {
    title: "Annalyn's Infiltration",
    description: "Learn about booleans while helping Annalyn rescue her friend.",
    icon_url: "https://raw.githubusercontent.com/exercism/website-icons/main/exercises/annalyns-infiltration.svg",
    toneIndex: 2,
  },
  {
    title: "Bird Watcher",
    description: "Learn about arrays by keeping track of how many birds visit your garden.",
    icon_url: "https://raw.githubusercontent.com/exercism/website-icons/main/exercises/bird-watcher.svg",
    toneIndex: 0,
  },
  {
    title: "Karl's Languages",
    description: "Learn about lists by helping Karl keep track of the languages he wants to learn on SlaveCode.",
    icon_url: "https://raw.githubusercontent.com/exercism/website-icons/main/exercises/karls-languages.svg",
    toneIndex: 2,
  },
  {
    title: "Calculator Conundrum",
    description: "Learn about exception-handling by making a simple calculator.",
    icon_url: "https://raw.githubusercontent.com/exercism/website-icons/main/exercises/calculator-conundrum.svg",
    toneIndex: 1,
  }
];

const MockPracticeCard = ({ card }: { card: typeof MOCK_PRACTICE_CARDS[0] }) => {
  const tone = tones[card.toneIndex];

  return (
    <Card className={cn(
      "group flex flex-row items-center gap-4 p-4 transition-all duration-300 hover:-translate-y-0.5",
      tone.chipBorder,
      tone.ring,
      "ring-1 ring-transparent" // to ensure it doesn't jump on hover if ring is added
    )}>
      {/* Icon */}
      <div className={cn("h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-full flex items-center justify-center p-1")}>
        <img width={100} height={100}
          src={card.icon_url}
          alt={card.title}
          className="h-full w-full object-contain rounded-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + card.title + "&background=random";
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={cn("font-bold text-foreground text-sm sm:text-base truncate transition-colors", tone.hoverAccent)}>{card.title}</h4>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {card.description}
        </p>
      </div>
    </Card>
  );
};

const MockGraphNode = ({ id, title, toneIndex }: { id: string, title: string, toneIndex: number }) => {
  const tone = tones[toneIndex];
  const abbr = title.substring(0, 2).charAt(0).toUpperCase() + title.substring(1, 2).toLowerCase();

  return (
    <Card id={id} className={cn(
        "group relative w-fit flex flex-row items-center gap-4 py-4 px-6 md:px-8 transition-all duration-300 hover:-translate-y-0.5 hover:ring-1 hover:border-2 hover:border-foreground z-10",
        tone.chipBorder
      )}>
      <div className={`relative flex h-10 w-10 items-center justify-center shrink-0`}>
        <ShapeGlyph icon={tone.icon} fill={tone.fill} className="w-full text-foreground" />
        <span className="absolute text-[10px] font-black uppercase tracking-wide text-slate-900">{abbr}</span>
      </div>

      <div className="pr-1 flex flex-col justify-center text-left">
        <div className="flex items-center gap-2">
          <h3 className={cn("text-base md:text-lg font-semibold whitespace-nowrap tracking-tight text-foreground", tone.hoverAccent)}>
            {title}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">
          0 / 1 exercise
        </p>
      </div>
    </Card>
  );
};

export const RoadmapPracticeHomeSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-5 md:px-0 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-10 items-center">

          {/* Left Side: The Graph Tree */}
          <div className="relative w-full flex flex-col justify-center gap-4">
            <div className="relative w-full h-[380px] md:h-[420px] flex items-center justify-center overflow-hidden pointer-events-none opacity-90">
              <Xwrapper>
                <div className="relative w-full h-full flex flex-col items-center justify-between py-8">
                  {/* Level 1 */}
                  <MockGraphNode id="mock-basics" title="Basics" toneIndex={0} />
                  
                  {/* Level 2 */}
                  <div className="flex flex-col sm:flex-row w-full items-center justify-around px-8 gap-8 sm:gap-0">
                    <MockGraphNode id="mock-booleans" title="Booleans" toneIndex={2} />
                    <MockGraphNode id="mock-strings" title="Strings" toneIndex={1} />
                  </div>

                  {/* Level 3 */}
                  <div className="hidden sm:flex flex-col sm:flex-row w-full items-center justify-around px-8 gap-8 sm:gap-0">
                    <MockGraphNode id="mock-ifelse" title="If-Else Statements" toneIndex={1} />
                    <MockGraphNode id="mock-numbers" title="Numbers" toneIndex={2} />
                  </div>
                </div>

                {/* Edges */}
                {[
                  { source: "mock-basics", target: "mock-booleans" },
                  { source: "mock-basics", target: "mock-strings" },
                  { source: "mock-booleans", target: "mock-ifelse", hiddenMobile: true },
                  { source: "mock-strings", target: "mock-numbers", hiddenMobile: true }
                ].map(e => (
                  <Xarrow
                    key={`${e.source}-${e.target}`}
                    start={e.source}
                    end={e.target}
                    color="#60a5fa"
                    strokeWidth={2}
                    dashness={{ strokeLen: 8, nonStrokeLen: 4, animation: false }}
                    showHead={false}
                    path="smooth"
                    startAnchor="bottom"
                    endAnchor="top"
                    passProps={{
                      className: cn("opacity-40", e.hiddenMobile && "hidden sm:block"),
                      style: { pointerEvents: "none" }
                    }}
                  />
                ))}
              </Xwrapper>

              {/* Fade out bottom overlay */}
              <div className="absolute inset-x-0 bottom-0 h-78 bg-linear-to-t from-background via-background/70 to-background/10 z-20 pointer-events-none" />
            </div>

            {/* CTA Button below grid */}
            <div className="flex flex-col items-center justify-center relative z-30">
              
              <p className="text-xs text-muted-foreground  font-medium text-center max-w-md leading-relaxed">
                Every language has a properly structured track roadmap having all detailed concepts and exercises.
              </p>
              <Button
                variant="link"
                className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0 mt-2"
                asChild
              >
                <Link href="/academy/tracks/java?tab=learn">
                  View Full Roadmap <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Side: Content & Practice Cards */}
          <div className="relative w-full flex flex-col justify-center gap-4">
            
            <div className="relative w-full overflow-hidden pb-5 p-1">
              {/* Practice Cards Grid */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 pointer-events-none opacity-90">
                {MOCK_PRACTICE_CARDS.map((card, i) => (
                  <div key={i} className={cn(i >= 3 ? "hidden sm:block" : "block")}>
                    <MockPracticeCard card={card} />
                  </div>
                ))}
              </div>

              {/* Fade out bottom overlay */}
              <div className="absolute inset-x-0 bottom-0 h-78 bg-linear-to-t from-background via-background/75 to-background/20 z-20 pointer-events-none" />
            </div>

            {/* CTA Button below grid */}
            <div className="flex flex-col items-center justify-center relative z-30">
             
              <p className="text-xs text-muted-foreground font-medium text-center max-w-md leading-relaxed">
                Each language has lots of basic to advanced questions to solve, so you can practice while learning.
              </p>
               <Button
                variant="link"
                className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0 mt-2"
                asChild
              >
                <Link href="/academy/tracks/java?tab=practice">
                  Explore Practice Exercises <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
