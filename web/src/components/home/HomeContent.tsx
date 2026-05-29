"use client";

import { Hero } from "./Hero";
import { Features } from "./Features";
import { HowItWorks } from "./HowItWorks";
import { Statistics } from "./Statistics";
import { DeepDive } from "./DeepDive";
<<<<<<< HEAD
import { CallToAction } from "./CallToAction";
=======
import { CompilerSection, CallToAction } from "./compilerVisual";
>>>>>>> prod-deploy
import { LandingFooter } from "./LandingFooter";

export const HomeContent = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <main>
        {/* 1.0 — Hero: Full-viewport centerpiece with beam glow + product preview */}
        <Hero />

        {/* 2.0 — Features: Bento grid showcase of all platform pillars */}
        <Features />

        {/* 3.0 — How It Works: Numbered steps with connector lines */}
<<<<<<< HEAD
        <HowItWorks />
=======
        {/* <HowItWorks /> */}
>>>>>>> prod-deploy

        {/* Statistics: By-the-numbers impact strip */}
        <Statistics />

        {/* 4.0 — Deep Dive: Alternating feature rows with live visuals */}
        <DeepDive />

<<<<<<< HEAD
        {/* 5.0 — CTA: Final call-to-action with glow centerpiece */}
=======
        {/* 5.0 — Compiler Showcase: Wide visual of the playground */}
        <CompilerSection />

        {/* 6.0 — CTA: Final call-to-action with glow centerpiece */}
>>>>>>> prod-deploy
        <CallToAction />
      </main>

      {/* Footer: Multi-column with system status */}
      <LandingFooter />
    </div>
  );
};
