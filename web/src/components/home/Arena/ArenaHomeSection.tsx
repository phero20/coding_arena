

import Link from "next/link";
import { ArrowRight, Clock, Rocket, LogOut, Swords, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ARENA_PARTICIPANTS = [
  { initials: "AK", name: "Alex K.", username: "@alexk" },
  { initials: "SJ", name: "Sarah J.", username: "@sarahj" },
  { initials: "MR", name: "Mike R.", username: "@miker" },
  { initials: "LD", name: "Lisa D.", username: "@lisad" },
];

export const ArenaHomeSection = () => {
  return (
    <section className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* LEFT SIDE: Arena Lobby Visual */}
        <div className="relative w-full flex flex-col justify-center opacity-90">
          <Card className="relative min-h-[450px]  shadow-none border-border/50 bg-background p-4 md:p-6 overflow-hidden pointer-events-none">
            <div className="mb-6 flex w-full justify-end gap-2">
              <div className="flex h-7 w-20 items-center gap-2 rounded border border-border/40 bg-card px-2">
                <Clock className="size-3 text-muted-foreground/60" />
                <span className="text-[10px] font-bold text-foreground/60">20 mins</span>
              </div>
              {/* <Button className="flex h-7 items-center gap-2 px-4">
                <Rocket className="size-3" />
                <span className="text-[10px] uppercase font-medium">Start Match</span>
              </Button> */}
              <Button className="h-7 p-3" variant="destructive" type="button">
                <LogOut className="size-3" />
                <span className="text-[10px] uppercase font-medium">Leave</span>
              </Button>
            </div>

            <div className="mb-6 flex items-center justify-center gap-2">
              <div className="flex h-8 w-8  items-center rounded-xl justify-center border border-border/50 bg-primary">
                <Swords className="size-4 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-black tracking-tight uppercase opacity-90 text-foreground">
                Arena Lobby
              </h2>
            </div>

            <div className="mb-6 grid w-full grid-cols-1 gap-3 md:grid-cols-2">
              <Card className="flex items-center justify-between gap-4 border-border/40 bg-card/80 px-3 py-3 shadow">
                <h2 className="max-w-[200px] truncate text-sm font-bold text-foreground/90">Maximum Sum Path Challenge</h2>
                <div className="flex gap-1.5">
                  <Badge className="border-none bg-difficulty-medium/10 px-2 py-0.5 text-[8px] font-black uppercase text-difficulty-medium">Medium</Badge>
                  <Badge className="bg-muted px-2 py-0.5 text-[8px] text-foreground uppercase">Java</Badge>
                </div>
              </Card>

              <Card className="flex items-center justify-between gap-6 border-border/40 bg-card/80 px-6 py-3 shadow">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    Invite Code
                  </span>
                  <div className="text-lg font-black tracking-widest text-primary uppercase leading-none">
                    82XJ-72
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded border border-border/40">
                  <Copy className="size-3 text-muted-foreground/60" />
                </div>
              </Card>
            </div>

            <div className="w-full space-y-4">
              <div className="mb-4 flex items-center gap-2">
                <h3 className="text-[10px] font-black tracking-[0.1em] text-foreground/40">Participants :</h3>
                <span className="text-[9px] font-bold text-muted-foreground">4 / 50</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <Card className="flex items-center gap-3 border border-primary/60 bg-card p-2.5">
                  <Avatar className="h-8 w-8 border border-background">
                    <AvatarFallback className="bg-muted text-[10px] font-black uppercase">
                      {ARENA_PARTICIPANTS[0].initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-primary">{ARENA_PARTICIPANTS[0].name}</span>
                      <Badge className="h-3.5 border-none bg-primary/20 px-1 text-[7px] font-black uppercase tracking-tighter text-primary">Host</Badge>
                    </div>
                    <span className="mt-0.5 text-[9px] leading-none text-muted-foreground">{ARENA_PARTICIPANTS[0].username}</span>
                  </div>
                </Card>

                {ARENA_PARTICIPANTS.slice(1).map((participant) => (
                  <Card key={participant.username} className="flex items-center gap-3 border border-border/40 bg-card/50 p-2.5">
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarFallback className="bg-muted text-[10px] font-black uppercase">
                        {participant.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-xs font-bold text-foreground/70">{participant.name}</span>
                      <span className="mt-0.5 text-[9px] leading-none text-muted-foreground">{participant.username}</span>
                    </div>
                  </Card>
                ))}

                <div className="flex min-h-[48px] items-center justify-center rounded-md border border-dashed border-border/80 bg-muted/10 p-3">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-foreground/30">46 slots remaining</span>
                </div>
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
              <Link href="/arena">
                Join Matches <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* RIGHT SIDE: Text content */}
        <div className="flex flex-col items-start text-left max-w-xl">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              <span className="text-primary">Host</span> or <span className="text-primary">Join</span> a match
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Select problems from our extensive catalog to host a custom coding match, or simply enter a pin code to join an active match. Compete in real-time against other challengers, global rankings and Arena Points are awarded based on your final rank and execution speed.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
