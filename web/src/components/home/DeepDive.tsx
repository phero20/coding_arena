"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { 
  ArenaLobbyVisual, 
  EditorVisual, 
  ArenaSelectionVisual,
  MatchResultVisual
} from "./ShowcaseVisuals";

const ease = [0.16, 1, 0.3, 1] as const;

/* ── Configuration ── */
const FEATURES = [
  {
    phase: "01 / Arena Selection",
    headline: "Define the Battlefield",
    description: "Orchestrate competitive environments at scale. Whether hosting a private 1v1 duel or a 50-player tournament, our engine handles the orchestration while you define the difficulty, language constraints, and problem topics.",
    highlights: ["Customizable Match Logic", "Instant Room Generation", "Topic-Specific Filtering"],
    visual: <ArenaSelectionVisual />,
    visualSpan: "lg:col-span-6",
    textSpan: "lg:col-span-6"
  },
  {
    phase: "02 / Tactical Lobby",
    headline: "Real-time Synchronization",
    description: "A unified command center for hosts and players. Monitor participant presence in real-time, adjust match parameters on the fly, and ensure every challenger is optimized for the battle ahead.",
    highlights: ["Live Participant Tracking", "Dynamic Match Settings", "Secure Room Protocols"],
    visual: <ArenaLobbyVisual />,
    visualSpan: "lg:col-span-8",
    textSpan: "lg:col-span-4"
  },
  {
    phase: "03 / High-Stakes Editor",
    headline: "Optimized Performance",
    description: "High-stakes coding without the latency. A dual-pane IDE synchronized with the arena server, featuring instant test feedback and a head-to-head submission tracker.",
    highlights: ["Sub-Millisecond Feedback", "Dual-Pane Documentation", "Cross-Player Status Sync"],
    visual: <EditorVisual />,
    visualSpan: "lg:col-span-9",
    textSpan: "lg:col-span-3"
  },
  {
    phase: "04 / Match Results",
    headline: "Post-Mortem Analytics",
    description: "A technical breakdown of every competitive encounter. Analyze rankings, compare solution logic, and review granular performance metrics across the field.",
    highlights: ["Interactive Leaderboard", "Animated Podium", "In-Depth Verdict Reporting"],
    visual: <MatchResultVisual />,
    visualSpan: "lg:col-span-8",
    textSpan: "lg:col-span-4"
  }
];

export const DeepDive = () => {
  return (
    <section id="deep-dive" className="relative py-32 bg-background overflow-hidden ">
      <Container className="max-w-[1440px] px-3 relative z-10">
        <div className="flex flex-col gap-32 md:gap-56">
          {FEATURES.map((feat, idx) => {
            const isReversed = idx % 2 !== 0;

            return (
              <div
                key={feat.phase}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center"
              >
                {/* Visual Section */}
                <div className={cn(
                  feat.visualSpan,
                  isReversed ? "lg:order-2" : "lg:order-1"
                )}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98, x: isReversed ? 20 : -20 }}
                    whileInView={{ opacity: 1, scale: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                  >
                    {feat.visual}
                  </motion.div>
                </div>

                {/* Text Section */}
                <div className={cn(
                  feat.textSpan,
                  "flex flex-col items-start gap-6",
                  isReversed ? "lg:order-1" : "lg:order-2"
                )}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="space-y-5"
                  >
                    

                    <div className="space-y-4">
                      <h3 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground leading-[1.08]">
                        {feat.headline}
                      </h3>
                      <p className="text-[15px] leading-relaxed text-muted-foreground/80">
                        {feat.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-1">
                       {feat.highlights.map((item) => (
                          <div key={item} className="flex items-center gap-2.5">
                             <CheckCircle2 className="size-3.5 text-primary/80" />
                             <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">{item}</span>
                          </div>
                       ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
