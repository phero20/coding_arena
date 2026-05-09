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
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                Arena
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-lg leading-relaxed font-medium">
                Compete with other developers in real-time coding matches. Test
                your speed and accuracy on the leaderboard.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-8">
              {[
                {
                  id: "01",
                  title: "Host Match",
                  desc: "Create a private room and share your invite code with others.",
                },
                {
                  id: "02",
                  title: "Choose Problem",
                  desc: "Select the difficulty and topic for the coding match.",
                },
                {
                  id: "03",
                  title: "Compete",
                  desc: "Solve the problem and pass all test cases to win the match.",
                },
              ].map((step) => (
                <div key={step.id} className="flex gap-6 group relative">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-border/40 flex items-center justify-center text-primary font-bold">
                      {step.id}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg tracking-tight uppercase">
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
