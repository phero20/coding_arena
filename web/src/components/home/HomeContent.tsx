import { Hero } from "./Hero";
import CompilerSection  from "./compilers/compilerVisual";
import AcademyHome from "./academy/AcademyHome";
import { RoadmapHomeSection } from "./roadmap/RoadmapHomeSection";
import { CompaniesHomeSection } from "./companies/CompaniesHomeSection";
import SystemdesignHome from "./systemdesign/SystemdesignHome";
import ArenaHome from "./Arena/ArenaHome";
import ContestsHome from "./contests/ContestsHome";
import { CTASection } from "./CTASection";

export const HomeContent = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <main>
        {/* 1.0 — Hero: Full-viewport centerpiece with beam glow + product preview */}
        <Hero />
        
        {/* 2.0 — Academy & Roadmap Section */}
        <AcademyHome />
        
        {/* 2.5 — Interactive Roadmap Mimic */}
        <RoadmapHomeSection />

        {/* 2.6 — Companies Section */}
        <CompaniesHomeSection />

        {/* 2.7 — System Design Section */}
        <SystemdesignHome />

        {/* 2.0 — Features: Bento grid showcase of all platform pillars */}
        {/* <Features /> */}

        {/* 3.0 — How It Works: Numbered steps with connector lines */}
        {/* <HowItWorks /> */}

        {/* Statistics: By-the-numbers impact strip */}
        {/* <Statistics /> */}

        {/* 4.0 — Arena Section */}
        <ArenaHome />

        {/* 4.1 — Contests Section */}
        <ContestsHome />

        {/* 4.5 — Deep Dive: Alternating feature rows with live visuals */}
        {/* <DeepDive /> */}

        {/* 5.0 — Compiler Showcase: Wide visual of the playground */}
        <CompilerSection />

        {/* 6.0 — CTA: Final call-to-action with glow centerpiece */}
        <CTASection />
      </main>
    </div>
  );
};
