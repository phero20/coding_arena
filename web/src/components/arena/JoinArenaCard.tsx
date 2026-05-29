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

export function JoinArenaCard() {
<<<<<<< HEAD
  const {
    roomId,
    setRoomId,
    isJoining,
    handleSubmit,
    canSubmit,
  } = useJoinArenaForm();

  return (
    <Card className="">
      <CardHeader>
        <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6 text-secondary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Join Arena
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter an invite code to join an existing match and test your skills.
=======
  const { roomId, setRoomId, isJoining, handleSubmit, canSubmit } =
    useJoinArenaForm();

  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6 text-secondary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Join Match
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter an invite code to join an existing match.
>>>>>>> prod-deploy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Invite Code (e.g. AB12XY)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            disabled={isJoining}
<<<<<<< HEAD
            className="h-12 bg-background/50 uppercase tracking-widest text-center"
=======
            className="h-12 bg-background/50 uppercase text-center font-bold"
>>>>>>> prod-deploy
            maxLength={6}
          />
          <Button
            type="submit"
            disabled={!canSubmit}
            size="icon"
<<<<<<< HEAD
            className="h-12 w-12 shrink-0 group-active:scale-95 transition-transform"
=======
            className="h-12 w-12 shrink-0 transition-all hover:opacity-90"
>>>>>>> prod-deploy
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
<<<<<<< HEAD

=======
>>>>>>> prod-deploy
