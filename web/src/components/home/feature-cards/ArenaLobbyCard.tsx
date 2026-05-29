import { Swords, KeyRound, ArrowRight } from "lucide-react";
import { BentoCard } from "./shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function ArenaLobbyCard() {
  return (
    <BentoCard href="/arena" className="min-h-[280px]">
      <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden group">
        
        {/* Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-border/40 bg-card/20 shrink-0">
          <div className="flex items-center gap-2">
            <Swords className="size-4 text-primary" />
            <span className="text-[11px] font-black uppercase tracking-wide text-foreground">Arena Lobby</span>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4 flex-1 justify-center bg-card/30">
            {/* Host Mockup */}
<<<<<<< HEAD
            <Card className="bg-card/60 transition-colors group-hover:border-border/80 border-border/40 shadow-none">
              <CardContent className="p-4 flex items-center gap-3">
                 <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Swords className="size-4 text-primary" />
                 </div>
                 <div className="text-left flex-1">
                    <CardTitle className="text-[11px] font-bold">Host Match</CardTitle>
                    <CardDescription className="text-[9px] mt-0.5">Create private matches</CardDescription>
                 </div>
                 <Button size="sm" className="h-7 px-3 text-[10px] shrink-0">Host</Button>
=======
            <Card className="bg-card/60 transition-colors group-hover:border-border/80 border-border/40 shadow-sm">
              <CardContent className="p-4 flex flex-col gap-3">
                 <div className="flex items-center gap-3">
                   <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Swords className="size-4 text-primary" />
                   </div>
                   <div className="text-left flex-1">
                      <CardTitle className="text-[11px] font-bold">Host Match</CardTitle>
                      <CardDescription className="text-[9px] mt-0.5">Create private matches</CardDescription>
                   </div>
                 </div>
                 <Button size="sm" className="h-8 w-full text-[10px]">Host</Button>
>>>>>>> prod-deploy
              </CardContent>
            </Card>

            {/* Join Mockup */}
<<<<<<< HEAD
            <Card className="bg-card/60 transition-colors group-hover:border-border/80 border-border/40 shadow-none">
=======
            <Card className="bg-card/60 transition-colors group-hover:border-border/80 border-border/40 shadow-sm">
>>>>>>> prod-deploy
              <CardContent className="p-4 flex flex-col gap-3">
                 <div className="flex items-center gap-3">
                   <div className="size-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <KeyRound className="size-4 text-secondary" />
                   </div>
                   <div className="text-left">
                      <CardTitle className="text-[11px] font-bold">Join Room</CardTitle>
                      <CardDescription className="text-[9px] mt-0.5">Enter access code</CardDescription>
                   </div>
                 </div>
                 
                 <div className="flex gap-2 w-full">
                   <Input 
                     readOnly 
                     value="AB12XY" 
                     className="h-8 text-[10px] bg-background/50 border-border/30 text-muted-foreground/30 font-mono tracking-widest text-center focus-visible:ring-0" 
                   />
                   <Button size="icon" className="size-8 shrink-0 transition-transform group-hover:scale-105">
                     <ArrowRight className="size-3.5" />
                   </Button>
                 </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </BentoCard>
  );
}
