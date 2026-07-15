import Image from "next/image";

import { AcademySection } from "@/components/dashboard/academy/AcademySection";
import { RoadmapSection } from "@/components/dashboard/roadmap/RoadmapSection";
import { ProblemSection } from "@/components/dashboard/problems/ProblemSection";
import { ArenaSection } from "@/components/dashboard/arena/ArenaSection";
import { SystemDesignSection } from "@/components/dashboard/SystemDesignSection";
import { CompanySection } from "@/components/dashboard/companies/CompanySection";
import { ContestSection } from "@/components/dashboard/ContestSection";
import { UserSection } from "@/components/dashboard/UserSection";
import SideRays from "@/components/ui/siderays";

const FEATURES = [
  "Academy",
  "Roadmaps",
  "Problems",
  "Arena",
  "System Design",
  "Companies",
  "Contests",
  "Users",
];

export default function Home() {
  return (
    <div className="relative flex flex-col gap-8 p-4 md:p-10">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
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
          opacity={0.18}
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
          opacity={0.18}
        />

        {/* Decorative Glow */}
        <div className="absolute left-1/2 top-32 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border bg-background/60 backdrop-blur-xl px-6 py-14 md:px-12 md:py-20 shadow-xl">

        <div className="flex flex-col items-center text-center space-y-8">

          {/* Badge */}

          <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            🚀 Open Source Coding Platform
          </div>

          {/* Logo */}

          <div className="relative">

            <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />

            <Image
              src="/logos/logo.png"
              alt="SlaveCode Admin Logo"
              width={120}
              height={120}
              className="relative object-contain"
            />
          </div>

          {/* Heading */}

          <div className="space-y-3">

            <h1 className="text-[clamp(3rem,9vw,6.5rem)] font-extrabold tracking-tight leading-none">

              SlaveCode

              <span className="text-primary"> Admin</span>

            </h1>

            <p className="mx-auto max-w-3xl text-lg md:text-xl text-muted-foreground">

              Manage academies, coding problems, roadmaps, contests, companies,
              users and platform resources from one modern administration
              dashboard.

            </p>

          </div>

          {/* Feature Chips */}

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl">

            {FEATURES.map((item) => (

              <span
                key={item}
                className="rounded-full border bg-background/70 px-4 py-2 text-sm font-medium shadow-sm transition-all duration-300 hover:border-primary hover:text-primary hover:shadow-md"
              >
                {item}
              </span>

            ))}

          </div>

        </div>

      </section>

      {/* Dashboard Sections */}

      <div className="grid grid-cols-1 gap-6">

        <AcademySection />

        <RoadmapSection />

        <ProblemSection />

        <ArenaSection />

        <SystemDesignSection />

        <CompanySection />

        <ContestSection />

        <UserSection />

      </div>

    </div>
  );
}
