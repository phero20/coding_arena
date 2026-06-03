"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";
import { tones } from "@/lib/tones";
export function HostArenaCard() {
  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader>
        <div
          className="w-12 h-12 rounded-xl border-[3px] border-foreground flex items-center justify-center mb-4 drop-shadow-sm"
          style={{ backgroundColor: tones[0].fill }}
        >
          <LayoutDashboard className="w-6 h-6 text-foreground" strokeWidth={2.5} />
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
          className="w-full h-12 text-sm font-black uppercase tracking-widest transition-all"
        >
          <Link href="/arena/select">Host Match</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
