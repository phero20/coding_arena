"use client";

import { useState } from "react";
import { useJoinArena } from "@/hooks/use-arena-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, ArrowRight } from "lucide-react";

export function JoinArenaCard() {
  const [roomId, setRoomId] = useState("");
  const { joinArena } = useJoinArena();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    joinArena(roomId);
  };

  return (
    <Card className="">
      <CardHeader>
        <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6 text-secondary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Join Arena</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter an invite code to join an existing match and test your skills.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Invite Code (e.g. AB12XY)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="h-12 bg-background/50 uppercase tracking-widest  text-center"
            maxLength={6}
          />
          <Button 
            type="submit" 
            disabled={!roomId.trim()}
            size="icon" 
            className="h-12 w-12 shrink-0 group-active:scale-95 transition-transform"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
