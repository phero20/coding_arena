"use client";

import { useJoinArenaForm } from "@/hooks/arena/use-join-arena-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KeyRound, ArrowRight, RefreshCw } from "lucide-react";
import { tones } from "@/lib/tones";

export function JoinArenaCard() {
  const { roomId, setRoomId, isJoining, handleSubmit, canSubmit } =
    useJoinArenaForm();

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader>
        <div
          className="w-12 h-12 rounded-xl border-[3px] border-foreground flex items-center justify-center mb-4 drop-shadow-sm"
          style={{ backgroundColor: tones[1].fill }}
        >
          <KeyRound className="w-6 h-6 text-foreground" strokeWidth={2.5} />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Join Match
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter an invite code to join an existing match.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Invite Code (e.g. AB12XY)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            disabled={isJoining}
            className="h-12 text-center font-bold"
            maxLength={6}
          />
          <Button
            type="submit"
            disabled={!canSubmit}
            size="icon"
            className="h-12 w-12 shrink-0 transition-all"
          >
            {isJoining ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
