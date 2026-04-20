"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import {
  UserPlus,
  Sword,
  TrendingUp,
  Medal,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Profile",
    description:
      "Sign up in seconds. Your profile tracks every submission, arena win, and rating shift — your entire coding journey in one place.",
  },
  {
    number: "02",
    icon: Sword,
    title: "Enter the Arena",
    description:
      "Challenge a developer globally to a timed algorithmic duel. Same problem, live results, real pressure. Only one wins.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Sharpen Your Skills",
    description:
      "Work through 500+ hand-curated problems spanning data structures, algorithms, and system design. Filter by difficulty and topic.",
  },
  {
    number: "04",
    icon: Medal,
    title: "Climb the Leaderboard",
    description:
      "A global ELO-based ranking system ensures every win matters. Your position reflects pure technical excellence — nothing else.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="relative py-40 overflow-hidden border-t border-border/20">
      {/* Ambience */}


      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left: Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
            >

              <h2 className="text-3xl md:text-5xl font-black tracking-[-0.03em] leading-[1.05] mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/80 to-foreground/30">
                  Four steps to the top.
                </span>
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                From zero to competitive coder. The arena is structured to
                take you from beginner to ranked competitor through
                deliberate practice and live battles.
              </p>
            </motion.div>
          </div>

          {/* Right: Steps */}
          <div className="space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease }}
                className="relative group"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[19px] top-[52px] w-px h-[calc(100%-20px)] bg-gradient-to-b from-border/40 to-transparent" />
                )}

                <div className="flex gap-6 pb-10">
                  {/* Number + Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="size-10 rounded-xl border border-border/40 bg-card/50 flex items-center justify-center group-hover:border-border/80 group-hover:bg-card transition-all duration-300">
                      <step.icon className="size-4 text-foreground/50 group-hover:text-foreground/80 transition-colors" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1.5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black tracking-widest text-muted-foreground/25 font-mono">
                        {step.number}
                      </span>
                      <h3 className="text-sm font-bold text-foreground/80 group-hover:text-foreground transition-colors">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground/60 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
