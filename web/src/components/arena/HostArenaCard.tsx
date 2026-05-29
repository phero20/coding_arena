"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords } from "lucide-react";

export function HostArenaCard() {
  return (
    <Card className="">
      <CardHeader>
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Swords className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Host a Match</CardTitle>
        <CardDescription className="text-muted-foreground">
          Create a private arena and invite your friends to a real-time coding battle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full h-12 text-lg font-semibold border-border/40 transition-transform">
          <Link href="/arena/select">
            Host Now
          </Link>
=======
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export function HostArenaCard() {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <LayoutDashboard className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Host Match
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Create a private room to compete with friends in real-time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          asChild
          className="w-full h-12 text-sm font-black uppercase tracking-widest border-border/40 transition-all hover:opacity-90"
        >
          <Link href="/arena/select">Host Match</Link>
>>>>>>> prod-deploy
        </Button>
      </CardContent>
    </Card>
  );
}
