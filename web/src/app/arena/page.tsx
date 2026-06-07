import { HostArenaCard } from "@/components/arena/HostArenaCard";
import { JoinArenaCard } from "@/components/arena/JoinArenaCard";
import { Separator } from "@/components/ui/separator";
import { ArenaLogo } from "@/components/arena/ArenaLogo";
import { tones } from "@/lib/tones";

export { arenaHubMeta as metadata } from "@/meta/arena/static";

function ShapeIcon({ icon, fill, className }: { icon: string, fill: string, className?: string }) {
  if (icon === 'circle') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10" fill={fill} />
    </svg>
  );
  if (icon === 'diamond') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className={className}>
      <rect x="4.5" y="4.5" width="15" height="15" fill={fill} transform="rotate(45 12 12)" rx="2" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className={className}>
      <polygon points="12 2 21 7 21 17 12 22 3 17 3 7" fill={fill} />
    </svg>
  );
}

export default function ArenaDashboardPage() {
  return (
    <div className="w-full flex justify-center min-h-screen items-center py-28 md:pt-16 md:pb-0  px-4">
      <div className="container max-w-7xl grid lg:grid-cols-2 gap-12 xl:gap-24 items-center">
        {/* Left Column: Info & Instructions */}
        <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 shrink-0">
                <ArenaLogo className="w-full h-full hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight md:text-6xl uppercase">
                  Arena
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground text-lg md:text-xl max-w-lg leading-relaxed font-medium">
              Compete with other developers in real-time coding matches. Test
              your speed and accuracy on the leaderboard.
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-8">
              {[
                {
                  id: "01",
                  title: "Host Match",
                  desc: "Create a private room and share your invite code with others.",
                  tone: tones[0],
                },
                {
                  id: "02",
                  title: "Choose Problem",
                  desc: "Select the difficulty and topic for the coding match.",
                  tone: tones[1],
                },
                {
                  id: "03",
                  title: "Compete",
                  desc: "Solve the problem and pass all test cases to win the match.",
                  tone: tones[2],
                },
              ].map((step) => (
                <div key={step.id} className="flex gap-6 group relative">
                  <div className="flex flex-col items-center pt-0.5">
                    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                      <ShapeIcon icon={step.tone.icon} fill={step.tone.fill} className="absolute inset-0 w-full h-full text-foreground drop-shadow-sm" />
                      <span className={`relative z-10 font-black text-sm ${step.tone.text}`}>
                        {step.id.replace(/^0/, '')}
                      </span>
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
            <Separator />
            <JoinArenaCard />
          </div>
        </div>
      </div>
    </div>
  );
}
