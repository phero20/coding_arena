"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { HeroWorkspaceDemo } from "./HeroWorkspaceDemo";
import dynamic from "next/dynamic";
import { Button } from "../ui/button";
const SideRays = dynamic(() => import("./ParticleNetwork"), { ssr: false });

const ease = [0.16, 1, 0.3, 1] as const;

export const Hero = () => {
  const [rayOpacity, setRayOpacity] = useState(0.7);

  useEffect(() => {
    const handleResize = () => {
      setRayOpacity(window.innerWidth < 768 ? 0.3 : 0.7);
    };
    handleResize(); // initial set
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="relative pt-24 md:pt-36 pb-20 overflow-hidden bg-background min-h-screen flex flex-col justify-center">
      {/* Dynamic Background */}
      <SideRays
        speed={3}
        rayColor1="#EAB308"
        rayColor2="#96c8ff"
        intensity={1.6}
        spread={3}
        origin="top-left"
        tilt={-55}
        saturation={0.3}
        blend={0.75}
        falloff={2.5}
        opacity={rayOpacity}
      />
      <SideRays
        speed={3}
        rayColor1="#EAB308"
        rayColor2="#96c8ff"
        intensity={1.6}
        spread={3}
        origin="top-right"
        tilt={55}
        saturation={0.3}
        blend={0.75}
        falloff={2.5}
        opacity={rayOpacity}
      />

      <Container className="relative z-10 py-6">
        {/* ── Hero Copy ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="flex flex-col xl:flex-row items-center md:items-center justify-between max-w-7xl mx-auto mb-20 gap-12 lg:gap-20 pb-10 px-2 md:px-4 lg:px-0"
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
              <span className="sr-only">The Ultimate Platform for Software Engineers</span>
              <span className="ml-1 text-5xl md:text-7xl lg:text-8xl leading-none text-primary/60">
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

            {/* Left-bordered section with paragraph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease }}
              className="border-l-2 border-border/60 pl-3 py-1 mb-8"
            >
              <p className="text-muted-foreground text-[15px] leading-relaxed">
                Master your skills with a comprehensive platform designed for growth. Access over <Link href="/problems" className="text-foreground font-semibold underline decoration-primary underline-offset-4 hover:text-primary transition-colors">11,000+ coding problems</Link>, explore our <Link href="/academy" className="text-foreground font-semibold underline decoration-primary underline-offset-4 hover:text-primary transition-colors">Academy</Link> supporting <Link href="/academy" className="text-foreground font-semibold underline decoration-primary underline-offset-4 hover:text-primary transition-colors">80 languages</Link> for beginners, and follow structured <Link href="/roadmap" className="text-foreground font-semibold underline decoration-primary underline-offset-4 hover:text-primary transition-colors">DSA roadmaps</Link>. Prepare for interviews with <Link href="/companies" className="text-foreground font-semibold underline decoration-primary underline-offset-4 hover:text-primary transition-colors">460+ company-specific questions</Link>, dive into <Link href="/systemdesign" className="text-foreground font-semibold underline decoration-primary underline-offset-4 hover:text-primary transition-colors">System Design</Link> with detailed concepts and a fully-featured AI-Powered Workspace, and more.
              </p>
            </motion.div>

            {/* Social Proof Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease }}
              className="flex items-center gap-3"
            >
              <Button variant="outline" className="transition-colors" asChild>
                <Link 
                  href="https://github.com/judge0/judge0#showcase" 
                  target="_blank"
                  className="flex items-center gap-2"
                >
                  <Award className="w-4 h-4 text-primary" />
                  <span>Officially Featured by <span className="font-bold text-primary">Judge0</span></span>
                </Link>
              </Button>
             
            </motion.div>
          </div>
        </motion.div>

        {/* ── Product Mockup ── */}
        <HeroWorkspaceDemo />
      </Container>
    </section>
  );
};
