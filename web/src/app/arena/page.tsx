import { HostArenaCard } from "@/components/arena/HostArenaCard";
import { JoinArenaCard } from "@/components/arena/JoinArenaCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Swords } from "lucide-react";

export default function ArenaDashboardPage() {
  return (
    <div className="w-full flex justify-center min-h-screen items-center py-28 md:pt-16 md:pb-0  px-4">
      <div className="container max-w-7xl grid lg:grid-cols-2 gap-12 xl:gap-24 items-center">
        {/* Left Column: Info & Instructions */}
        <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="space-y-6">

            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-linear-to-b from-foreground to-foreground/50 bg-clip-text text-transparent italic flex items-center gap-4">
                <Swords className="h-12 w-12 text-primary" />
                ARENA
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-lg leading-relaxed font-medium">
                The ultimate testing ground for speed and precision. 
                Challenge rivals in real-time coding duels.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap">
                Operational Protocol
              </h3>
              <Separator className="flex-1 opacity-20" />
            </div>
            
            <div className="space-y-8">
              {[
                {
                  id: "01",
                  title: "Initialize Room",
                  desc: "Host a battle sector and broadcast your invite code to challengers.",
                },
                {
                  id: "02",
                  title: "Select Domain",
                  desc: "The host picks the algorithmic domain for the random challenge.",
                },
                {
                  id: "03",
                  title: "Execute & Conquer",
                  desc: "First programmer to pass all neural tests claims the victory.",
                },
              ].map((step) => (
                <div key={step.id} className="flex gap-6 group relative">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-border/40 flex items-center justify-center text-primary font-bold">
                      {step.id}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg tracking-tight uppercase italic">
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="relative group">
          <div className="relative grid gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
            <HostArenaCard />
            <JoinArenaCard />
          </div>
        </div>
      </div>
    </div>
  );
}
