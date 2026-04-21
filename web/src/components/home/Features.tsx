"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import { PracticeModeCard } from "./feature-cards";
import { ArenaCard } from "./feature-cards";
import { ArenaLobbyCard } from "./feature-cards";
import { CompilerCard } from "./feature-cards";

const Math_ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" } as const,
  transition: { duration: 0.7, delay, ease: Math_ease },
});

export const Features = () => {
  return (
    <section className="relative py-40 overflow-hidden">
      <Container className="relative z-10">
        {/* ── Heading ── */}
        <motion.div {...fadeUp(0)} className="mb-20">
          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.03em] leading-[1.05] max-w-2xl">
            <span className="text-foreground">
              Everything you need to compete and grow.
            </span>
          </h2>
          <p className="mt-5 text-muted-foreground text-base max-w-md leading-relaxed">
            A unified platform built around the developer&apos;s journey — from
            your first algorithm to your first arena win.
          </p>
        </motion.div>

        {/* ═════════ BENTO GRID ═════════ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <motion.div {...fadeUp(0.05)} className="md:col-span-7">
            <PracticeModeCard />
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="md:col-span-5">
            <ArenaCard />
          </motion.div>

          <motion.div {...fadeUp(0.14)} className="md:col-span-4">
            <ArenaLobbyCard />
          </motion.div>

          <motion.div {...fadeUp(0.18)} className="md:col-span-8">
            <CompilerCard />
          </motion.div>
        </div>
      </Container>
    </section>
  );
};
