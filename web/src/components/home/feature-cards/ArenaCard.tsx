import { ArrowRight, Swords, Timer, Lock, Zap } from "lucide-react";
import { BentoCard, CardHeader } from "./shared";

export function ArenaCard() {
  return (
    <BentoCard href="/arena" className="min-h-[360px]">
      <CardHeader
        icon={Swords}
        title="The Arena"
<<<<<<< HEAD
        right={
          <span className="text-xs text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex items-center gap-1">
            Enter <ArrowRight className="size-3" />
          </span>
        }
=======
>>>>>>> prod-deploy
      />
      <div className="flex-1 p-5 flex flex-col justify-center gap-4">
        {[
          {
            icon: Timer,
            label: "Timed Matches",
            desc: "Compete against other coders on the exact same problem, racing the clock.",
          },
          {
            icon: Lock,
            label: "Shared Challenge",
            desc: "All participants receive the same challenge simultaneously.",
          },
          {
            icon: Zap,
            label: "Live Leaderboards",
            desc: "Watch ranks shift in real-time as test cases pass and coders submit.",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 py-3 border-b border-border/10 last:border-0"
          >
            <div className="size-7 rounded-md border border-border/30 bg-card/50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <item.icon className="size-3.5 text-foreground/40" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground/70 mb-0.5">
                {item.label}
              </p>
              <p className="text-[11px] text-muted-foreground/50 leading-snug">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
