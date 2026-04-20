"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import { Card } from "@/components/ui/card";
import {
  Activity,
  BarChart2,
  Swords,
  Code2,
  User,
  ShieldCheck,
  Check,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/* Heatmap matching exact GritGraph color levels */
const heatmapData = Array.from({ length: 16 }, () =>
  Array.from({ length: 7 }, () => Math.random()),
);

/* What your profile actually tracks — accurate to the real app */
const profileFeatures = [
  {
    icon: Activity,
    title: "Submission Heatmap",
    description: "Every coding day mapped — just like GitHub contribution graphs. Streaks, gaps, and peak weeks are all visible.",
  },
  {
    icon: Code2,
    title: "Solve Breakdown",
    description: "Problems you've solved split by Easy, Medium, and Hard, with an animated arc diagram showing your distribution.",
  },
  {
    icon: Swords,
    title: "Arena History",
    description: "Every match you've played — opponent, outcome, problem, and your ELO change for that match.",
  },
  {
    icon: BarChart2,
    title: "Submission Log",
    description: "Full history of every submission with verdict, language, runtime, and the exact code you submitted.",
  },
  {
    icon: ShieldCheck,
    title: "Rating & Rank",
    description: "Your ELO-based arena rating updates after every match. See how your rating has moved over time.",
  },
  {
    icon: User,
    title: "Public Profile",
    description: "Your profile page is public by default. Share it and let your stats speak for themselves.",
  },
];

export const Statistics = () => {
  return (
    <section className="relative py-40 overflow-hidden border-t border-border/20">

      <Container className="relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="mb-20"
        >

          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.03em] leading-[1.05] max-w-2xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/80 to-foreground/30">
              Every stat. Every battle. One profile.
            </span>
          </h2>
          <p className="mt-5 text-muted-foreground text-base max-w-lg leading-relaxed">
            Your profile is a living record of everything you&apos;ve done —
            visualized and shareable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Feature grid — MetricCard-derived styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profileFeatures.map((feat, index) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.07, ease }}
              >
                {/* MetricCard exact structure */}
                <div className="p-5 border border-border/40 bg-card/30 rounded-xl flex items-start gap-4 hover:border-border/70 hover:bg-card/50 transition-all duration-300 h-full group">
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/20 group-hover:bg-muted transition-colors">
                    <feat.icon className="size-4 text-foreground/50" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[10px] uppercase text-muted-foreground/60 tracking-wide">
                      {feat.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Profile card visual — pixel-faithful to the real profile page */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
          >
            <Card className="border-border/30 bg-card/20 overflow-hidden">
              {/* StatsHeader mock — exact structure as real component */}
              <div className="px-6 py-6 border-b border-border/30">
                <div className="flex items-end gap-5">
                  {/* Avatar with gradient ring — exact StatsHeader pattern */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-muted/30 rounded-full blur opacity-20" />
                    <div className="relative size-16 rounded-full border-2 border-background ring-1 ring-border/30 bg-muted/40 flex items-center justify-center">
                      <span className="text-xl font-black italic text-muted-foreground/40 uppercase">
                        YO
                      </span>
                    </div>
                    <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1 rounded-full border border-background shadow-sm">
                      <ShieldCheck className="size-2.5" />
                    </div>
                  </div>
                  <div className="space-y-1 pb-1">
                    <div className="h-6 w-36 rounded bg-foreground/10" />
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40">
                      <CalendarDays className="size-3" />
                      <span>Joined Apr 2026</span>
                      <span className="size-1 rounded-full bg-border" />
                      <span>Official Participant</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Heatmap — matches GritGraph card exactly */}
              <div className="px-6 py-5 border-b border-border/20">
                {/* GritGraph header row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40">
                    <span className="bg-muted/50 px-1.5 py-0.5 rounded border border-border/20 font-bold text-foreground/40">
                      —
                    </span>
                    <span>submissions in the past year</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[9px] text-muted-foreground/30 mb-3">
                  <span>Active days: <strong className="text-foreground/30">—</strong></span>
                  <span className="h-2.5 border-r border-border/30" />
                  <span>Current streak: <strong className="text-foreground/30">—</strong></span>
                </div>
                {/* Heatmap grid — exact GritGraph cell sizing */}
                <div className="flex gap-[3px]">
                  {heatmapData.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px] flex-1">
                      {week.map((val, di) => (
                        <div
                          key={di}
                          className={cn(
                            "w-[11px] h-[11px] rounded-[2px] border border-border/20",
                            val < 0.15 ? "bg-muted/90"
                              : val < 0.4 ? "bg-difficulty-easy/30"
                              : val < 0.65 ? "bg-difficulty-easy/60"
                              : val < 0.85 ? "bg-difficulty-easy/80"
                              : "bg-difficulty-easy",
                          )}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* SolveBreakdown mock — same layout as real component */}
              <div className="px-6 py-5">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 block mb-4">
                  Solved by Difficulty
                </span>
                <div className="flex gap-4 items-center">
                  {/* Arc placeholder — same structure as SVG in SolveBreakdown */}
                  <div className="size-[80px] rounded-full border-4 border-border/20 flex items-center justify-center shrink-0 relative">
                    <div className="text-center">
                      <p className="text-lg font-bold leading-none text-foreground/40">—</p>
                      <div className="flex items-center gap-0.5 mt-1">
                        <Check className="size-2.5 text-difficulty-easy" />
                        <span className="text-[8px] font-medium text-foreground/30">Solved</span>
                      </div>
                    </div>
                  </div>
                  {/* Triple-box vertical stack — exact SolveBreakdown right panel */}
                  <div className="flex-1 space-y-1.5">
                    {[
                      { label: "Easy", color: "text-difficulty-easy" },
                      { label: "Medium", color: "text-difficulty-medium" },
                      { label: "Hard", color: "text-difficulty-hard" },
                    ].map((d) => (
                      <div
                        key={d.label}
                        className="p-2 rounded-lg bg-muted/40 border border-border/10 flex items-center justify-between"
                      >
                        <span className={cn("text-[10px] font-semibold uppercase", d.color)}>
                          {d.label}
                        </span>
                        <span className="text-xs text-muted-foreground/30 font-bold">
                          — <span className="text-[9px] font-normal">/ —</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};
