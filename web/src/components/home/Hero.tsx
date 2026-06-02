"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/Container";
import { Code2, Terminal } from "lucide-react";
import { HeroWorkspaceDemo } from "./HeroWorkspaceDemo";

const ease = [0.16, 1, 0.3, 1] as const;

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Subtle structural grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <Container className="relative z-10 py-44">
        {/* ── Hero Copy ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="flex flex-col md:flex-row items-center md:items-center justify-between max-w-7xl mx-auto mb-20 gap-12 lg:gap-20 pb-10 px-2 md:px-4 lg:px-0"
        >
          {/* Left Side: Brand Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="flex-1 text-left w-full flex items-center justify-start min-w-0"
          >
            <h1 className="text-[clamp(2.75rem,14vw,7.5rem)] font-bold tracking-tight text-foreground leading-none flex items-baseline whitespace-nowrap max-w-full">
              SlaveCode
              <span className="ml-1 text-[clamp(2.75rem,14vw,7.5rem)] leading-none text-primary/60">
                .
              </span>
            </h1>
          </motion.div>

          {/* Right Side: Copy & CTA */}
          <div className="flex-1 text-left w-full flex flex-col justify-center">
            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
              className="text-3xl lg:text-4xl xl:text-5xl font-medium tracking-[-0.02em] leading-[1.2] mb-8 text-muted-foreground/70"
            >
              Your{" "}
              <span className="text-foreground tracking-tight font-semibold">
                code
              </span>{" "}
              is your master. <br className="hidden md:block" /> Serve it well.
            </motion.h2>

            {/* Left-bordered section with paragraph and button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease }}
              className="border-l-2 border-border/60 pl-3 max-w-md py-1"
            >
              <p className="text-muted-foreground text-[15px] leading-relaxed mb-6">
                Stop thinking and start delivering. The industry doesn&apos;t
                want your creativity; it wants your total submission to the
                roadmap. Survive the whip of the grind and prove you have the
                grit to be a top-tier unit of labor.
              </p>

              <div className="flex flex-row items-start gap-4 mt-2">
                <Button asChild size="lg" className="h-11 px-6 font-semibold">
                  <Link href="/problem">
                    <Code2 className="mr-2 size-4" />
                    Problems
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-11 px-6 font-semibold text-muted-foreground hover:text-foreground"
                >
                  <Link href="/compilers">
                    <Terminal className="mr-2 size-4" />
                    Compilers
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Product Mockup ── */}
        <HeroWorkspaceDemo />
      </Container>
    </section>
  );
};
