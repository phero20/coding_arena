

import Link from "next/link";
import { ArrowRight, ArrowLeft, Menu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
    HexDatabaseIcon,
    HexLoadBalancerIcon,
    HexCacheIcon,
    HexMessageQueueIcon,
    HexApiGatewayIcon,
    HexServerIcon,
    HexCdnIcon,
    HexStorageIcon
} from "@/components/systemdesign-workspace/about/system-design-icons";

const HEX_ICONS = [
    { Component: HexDatabaseIcon, name: "Database" },
    { Component: HexLoadBalancerIcon, name: "Load Balancer" },
    { Component: HexCacheIcon, name: "Cache" },
    { Component: HexCdnIcon, name: "CDN" },
    { Component: HexServerIcon, name: "Microservices" },
    { Component: HexMessageQueueIcon, name: "Message Queue" },
    { Component: HexApiGatewayIcon, name: "API Gateway" },
    { Component: HexStorageIcon, name: "Blob Storage" },
];

export const SystemDesignHomeSection = () => {
  return (
    <section className="py-8">
      <div className="">
        
        {/* ROW 1: Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 md:gap-10 items-center">
            
          {/* LEFT SIDE: Hexagon Header + Text */}
          <div className="flex flex-col items-start text-left max-w-2xl">
            <div className="mb-8 w-full origin-left flex flex-col items-center text-center space-y-10">
                {/* Overlapping Hexagon Arc */}
                <div className="flex items-center justify-center -space-x-4 sm:-space-x-6">
                    {HEX_ICONS.map((icon, i) => (
                        <div
                            key={icon.name}
                            className="relative"
                            style={{
                                zIndex: 10 - Math.floor(Math.abs(3.5 - i)),
                                transform: `translateY(${Math.pow(i - 3.5, 2) * 1.5}px)`
                            }}
                            title={icon.name}
                        >
                            <icon.Component className="h-14 w-14 sm:h-[5.5rem] sm:w-[5.5rem] object-contain drop-shadow-sm" />
                        </div>
                    ))}
                </div>

                {/* Typography */}
                <div className="space-y-6 flex flex-col items-center">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                        <span className="text-primary">56 topics</span> for you to master
                    </h2>
                    
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Master system design through structured, in-depth learning tracks. Dive into 56 essential topics and concepts designed for deliberate practice.
                    </p>
                </div>
            </div>
          </div>

          {/* RIGHT SIDE: Learn Page Demo UI */}
          <div className="relative w-full flex flex-col justify-center">
            
            {/* The Mock Browser/App Window */}
            <Card className="relative w-full overflow-hidden flex h-[400px] sm:h-[480px] pointer-events-none opacity-90 shadow-none border-border/50">
                
                {/* Sidebar */}
                <div className="w-[140px] sm:w-[180px] shrink-0 border-r border-border/40 flex-col bg-card/30 hidden md:flex">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 gap-2">
                        <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-medium border border-border/40 rounded-md px-2 py-1 bg-background">
                            <ArrowLeft className="w-3 h-3" /> Back
                        </div>
                        <span className="text-xs text-foreground/80 tracking-tight">Topics</span>
                    </div>
                    <div className="flex flex-col gap-1 p-2">
                        <div className="flex items-center px-3 py-2 bg-secondary rounded-md">
                            <span className="text-[11px]  font-medium text-primary whitespace-normal text-left truncate">What is system design?</span>
                        </div>
                        {[
                            "IP", "OSI Model", "TCP and UDP", "Domain Name System", 
                            "Load Balancing", "Clustering", "Caching", "CDN", "Proxy"
                        ].map((topic) => (
                            <div key={topic} className="px-3 py-2 text-[11px]  font-normal text-muted-foreground hover:text-foreground whitespace-normal text-left truncate">
                                {topic}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                
                <div className="flex-1 p-5 sm:p-8 flex flex-col gap-6 sm:gap-8 overflow-hidden bg-background">
                    <div className="md:hidden flex items-center justify-between">
                    Topics<Menu />
                </div>
                    <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-2xl  font-extrabold text-primary tracking-tight">What is system design?</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Before we start this course, let's talk about what even is system design.
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            System design is the process of defining the architecture, interfaces, and data for a system that satisfies specific requirements. System design meets the needs of your business or organization through coherent and efficient systems. It requires a systematic approach to building and engineering systems.
                        </p>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-2xl  font-extrabold text-primary tracking-tight">Why is it important?</h3>
                        <p className="text-xs  text-muted-foreground leading-relaxed">
                            System design helps us define a solution that meets the business requirements. It is one of the earliest decisions we can make when building a system. Often it is essential to think from a high level as these decisions are very difficult to correct later.
                        </p>
                    </div>
                </div>

             
            </Card>

            {/* Section Level Fade Overlay (to blend the card into the section background) */}
            <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-background via-background/70 to-transparent z-10 pointer-events-none" />
<div className="flex flex-col items-center justify-center relative z-30">
              <Button 
                variant="link" 
                className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0"
                asChild
              >
                <Link href="/systemdesign">
                  See all Topics <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>

        </div>



      </div>
    </section>
  );
};
