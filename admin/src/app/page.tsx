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

export default function Home() {
  return (
    <div className="flex flex-col gap-6 p-2 md:p-10">
      <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none -z-10">
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
          opacity={0.2}
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
          opacity={0.2}
        />
      </div>

      <div className="flex flex-col items-center justify-center space-y-6 my-16 text-center animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col md:flex-row items-center">
          <Image
            src="/logos/logo.png"
            alt="SlaveCode Admin Logo"
            width={116}
            height={116}
            className="object-contain"
          />
          <h1 className="text-[clamp(2.75rem,14vw,7.5rem)] font-bold tracking-tight text-foreground leading-none flex items-baseline whitespace-nowrap max-w-full">
            SlaveCode
            <span className="ml-1 text-5xl md:text-7xl lg:text-8xl leading-none text-primary/60">
              .
            </span>
          </h1>
        </div>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
          Monitor real-time analytics, manage your platform content, and oversee
          overall system health.
        </p>
      </div>

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
