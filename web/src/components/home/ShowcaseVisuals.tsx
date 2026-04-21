"use client";

import { 
  Swords, 
  Terminal, 
  Clock, 
  Copy, 
  Code2, 
  KeyRound,
  ArrowRight,
  Rocket,
  LogOut,
  ChevronLeft,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  WrapText,
  RefreshCw,
  CircleCheck,
  Play,
  Send,
  User,
  Users,
  Trophy
} from "lucide-react";

import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { VerdictBadge } from "../ui/verdict-badge";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const JAVA_CODE = `class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`;

const ARENA_PARTICIPANTS = [
  { initials: "JO", name: "John Carter", username: "johncarter", isHost: true },
  { initials: "AL", name: "Alicia Brown", username: "aliciab", isHost: false },
  { initials: "RV", name: "Ravi Verma", username: "raviv", isHost: false },
  { initials: "SK", name: "Sharukh Khan", username: "sharukhkhan", isHost: false },
];

const ARENA_RESULTS = [
  { rank: 1, name: "John Carter", username: "johncarter", score: "120", verdict: "Accepted" },
  { rank: 2, name: "Alicia Brown", username: "aliciab", score: "80", verdict: "Accepted" },
  { rank: 3, name: "Ravi Verma", username: "raviv", score: "50", verdict: "Wrong Answer" },
  { rank: 4, name: "Sharukh Khan", username: "sharukhkhan", score: "20", verdict: "Wrong Answer" },
];

/* ── 1. Arena Selection Visual ── */
export const ArenaSelectionVisual = () => (
  <Card className="relative  border border-border/60 bg-card/40 p-4 md:p-6 ring-1 ring-border/25 shadow-[0_16px_36px_-22px_hsl(var(--foreground)/0.65)]">
    <div className="grid gap-4">
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Swords className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Host a Match
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Create a private arena and invite your friends to a real-time coding battle.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button className="h-10 w-full text-sm font-semibold">
            Host Now
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-md bg-secondary/10">
            <KeyRound className="w-4 h-4 text-secondary" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Join Arena
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Enter an invite code to join an existing match and test your skills.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <div className="flex h-10 flex-1 items-center justify-center rounded-md border border-border/40 bg-background/50 text-sm font-black tracking-[0.22em] text-muted-foreground/40 uppercase text-center">
              AB12XY
            </div>
            <Button size="icon" className="h-10 w-10 shrink-0">
              <ArrowRight className="w-5 h-5 text-primary-foreground" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </Card>
);

/* ── 2. Arena Lobby Visual ── */
export const ArenaLobbyVisual = () => (
  <Card className="relative min-h-[500px]  border border-border/60 bg-card/40 p-4 md:p-6 ring-1 ring-border/25 shadow-[0_16px_36px_-22px_hsl(var(--foreground)/0.65)]">
    <div className="mb-6 flex w-full justify-end gap-2">
      <div className="flex h-8 w-28 items-center gap-2 rounded border border-border/40 bg-card px-2">
        <Clock className="size-3.5 text-muted-foreground/60" />
        <span className="text-[10px] font-bold text-foreground/60">20 mins</span>
      </div>
      <div className="flex h-8 items-center gap-2 rounded bg-primary px-4 text-primary-foreground">
        <Rocket className="size-3.5" />
        <span className="text-[10px] uppercase font-medium">Start Match</span>
      </div>
      <Button className="h-8 px-3" variant="destructive" type="button">
        <LogOut className="size-3.5" />
        <span className="text-[10px] uppercase font-medium">Leave</span>
      </Button>
    </div>

    <div className="mb-6 flex items-center justify-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-primary">
        <Swords className="w-5 h-5 text-primary-foreground" />
      </div>
      <h1 className="text-2xl font-black tracking-tight uppercase italic opacity-90 text-foreground">
        Arena Lobby
      </h1>
    </div>

    <div className="mb-6 grid w-full grid-cols-1 gap-3 md:grid-cols-2">
      <Card className="flex items-center justify-between gap-4 border-border/40 bg-card/80 px-3 py-3">
        <h2 className="max-w-[200px] truncate text-sm font-bold text-foreground/90">Maximum Sum Path Challenge</h2>
        <div className="flex gap-1.5">
          <Badge className="border-none bg-difficulty-medium/10 px-2 py-0.5 text-[8px] font-black uppercase text-difficulty-medium">Medium</Badge>
          <Badge className="bg-muted px-2 py-0.5 text-[8px] text-foreground uppercase">Java</Badge>
        </div>
      </Card>

      <Card className="flex items-center justify-between gap-6 border-border/40 bg-card/80 px-6 py-3">
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
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Participants</h3>
        <span className="h-4 rounded border border-border/10 bg-muted/80 px-1.5 text-[9px] font-bold text-muted-foreground">4 / 50</span>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="flex items-center gap-3 border border-primary bg-card p-2.5">
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
);

/* ── 3. Editor Visual ── */
export const EditorVisual = () => (
  <Card className="relative flex min-h-[600px] flex-col overflow-hidden p-0 md:p-0">
    <div className="flex flex-1 flex-col overflow-hidden  border border-border/40 bg-card/70">
      <header className="relative flex h-14 items-center border-b border-border/40 bg-card/20 px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 items-center gap-1.5 rounded border border-border/40 px-3 opacity-60">
            <ChevronLeft className="size-3.5" />
            <span className="text-[11px] font-bold hidden md:inline">Exit</span>
          </div>
        </div>

        <Badge className="absolute left-1/2 -translate-x-1/2 text-foreground h-8 px-3 border border-border/40 bg-card flex items-center gap-1.5">
          <Clock className="size-3" />
          <span className="text-[10px] font-black tracking-widest ">
            18:20
          </span>
        </Badge>

        <div className="ml-auto flex items-center gap-2 opacity-70">
          <div className="flex h-8 items-center gap-1.5 rounded border border-border/40 px-3">
            <Play className="size-3.5" />
            <span className="text-[11px] font-bold hidden md:inline">Run</span>
          </div>
          <div className="flex h-8 items-center gap-1.5 rounded bg-primary px-3 text-[11px] font-bold text-primary-foreground">
            <Send className="size-3.5" />
            Submit
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-x divide-border/40 overflow-hidden">
        <div className="flex flex-col min-w-0 bg-card/10">
          <div className="px-4 border-b border-border/40 bg-muted/10 shrink-0">
            <div className="flex items-center gap-4 h-10 overflow-x-auto hide-scrollbar">
              <div className="flex items-center gap-1.5 h-full px-1 text-[10px] font-black uppercase tracking-wide border-b-2 border-primary text-primary shrink-0">
                <BookOpen className="size-3.5" />
              </div>
              {[
                { label: "Hints", icon: HelpCircle },
                { label: "Participants", icon: Users },
              ].map((tab) => (
                <div
                  key={tab.label}
                  className="flex items-center gap-1.5 h-full px-1 text-[10px] font-black uppercase tracking-wide border-b-2 border-transparent text-muted-foreground/40 shrink-0 whitespace-nowrap"
                >
                  <tab.icon className="size-3.5" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 space-y-5 overflow-y-auto hide-scrollbar">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-foreground">
                  1. Two Sum
                </h2>
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold text-difficulty-easy border-difficulty-easy bg-difficulty-easy/5"
                >
                  Easy
                </Badge>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <Badge className="text-[8px] h-4">Array</Badge>
                <Badge className="text-[8px] h-4">Hash Table</Badge>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Given an array of integers nums and an integer target, return indices
              of the two numbers such that they add up to target. You may assume
              each input has exactly one solution, and you may not use the same
              element twice. You can return the answer in any order.
            </p>

            <div className="space-y-2 pt-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                Example 1
              </p>
              <div className="rounded-lg border border-border bg-muted/50 p-3 font-mono text-[10px] text-foreground/70 space-y-1">
                <p>
                  <span className="text-muted-foreground">Input:</span>{" "}
                  nums = [2,7,11,15], target = 9
                </p>
                <p>
                  <span className="text-muted-foreground">Output:</span> [0,1]
                </p>
                <p className="text-muted-foreground/40">
                  // Because nums[0] + nums[1] = 9
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                Example 2
              </p>
              <div className="rounded-lg border border-border bg-muted/50 p-3 font-mono text-[10px] text-foreground/70 space-y-1">
                <p>
                  <span className="text-muted-foreground">Input:</span>{" "}
                  nums = [3,2,4], target = 6
                </p>
                <p>
                  <span className="text-muted-foreground">Output:</span> [1,2]
                </p>
                <p className="text-muted-foreground/40">
                  // Because nums[1] + nums[2] = 6
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                Constraints
              </p>
              <ul className="space-y-1 list-disc list-inside">
                {[
                  "2 <= nums.length <= 104",
                  "-109 <= nums[i] <= 109",
                  "-109 <= target <= 109",
                ].map((constraint) => (
                  <li key={constraint} className="text-[10px] text-muted-foreground">
                    <code className="px-1 py-0.5 rounded bg-muted/40 text-[10px]">
                      {constraint}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col min-w-0 bg-card/80">
          <div className="h-12 px-3 flex items-center gap-2 border-b border-border/40 bg-card/20 shrink-0">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="font-black tracking-widest text-[9px] uppercase py-0.5 px-2 border-border/40 text-primary bg-primary/5"
              >
                JAVA
              </Badge>
              <div className="size-7 rounded border border-border/40 flex items-center justify-center opacity-40">
                <WrapText className="size-3" />
              </div>
              <div className="size-7 rounded border border-border/40 flex items-center justify-center opacity-40">
                <RefreshCw className="size-3" />
              </div>
            </div>
            <div className="ml-auto flex items-center h-full">
              <div className="flex items-center gap-1.5 h-full px-3 text-[10px] font-black uppercase tracking-wide border-b-2 border-primary text-primary">
                <Code2 className="size-3 mr-1" />
                <span className="hidden sm:inline">Code</span>
              </div>
              <div className="flex items-center gap-1.5 h-full px-3 text-[10px] font-black uppercase tracking-wide border-b-2 border-transparent text-muted-foreground/30">
                <Terminal className="size-3 mr-1" />
                <span className="hidden sm:inline">Tests</span>
              </div>
              <div className="flex items-center gap-1.5 h-full px-3 text-[10px] font-black uppercase tracking-wide border-b-2 border-transparent text-muted-foreground/30">
                <CircleCheck className="size-3 mr-1" />
                <span className="hidden sm:inline">Result</span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative bg-card/80">
            <SyntaxHighlighter
              language="java"
              style={vscDarkPlus}
              showLineNumbers
              PreTag="div"
              customStyle={{
                margin: 0,
                padding: "0.75rem",
                fontSize: "0.7rem",
                lineHeight: "1.7",
                background: "transparent",
                height: "100%",
              }}
              lineNumberStyle={{
                color: "hsl(var(--muted-foreground) / 0.2)",
                minWidth: "1.5rem",
                paddingRight: "0.75rem",
                userSelect: "none",
              }}
            >
              {JAVA_CODE}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

/* ── 4. Match Result Visual ── */
export const MatchResultVisual = () => (
   <Card className="relative p-6  border border-border/60 bg-card/40 ring-1 ring-border/25 shadow-2xl min-h-[600px] flex flex-col items-center">
    {/* Podium Section */}
    <div className="flex items-end justify-center gap-4 mb-12 w-full max-w-2xl px-4 overflow-visible">
      {/* 2nd Place */}
      <div className="flex flex-col items-center gap-3 mb-4">
        <div className="relative">
          <Avatar className="size-16 md:size-20 border-2 border-border/40 bg-card">
            <AvatarFallback className="text-xs md:text-sm font-black">AB</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-card border border-border/40 text-[8px] font-black uppercase shadow-sm">2</div>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-bold text-foreground/50 block">Alicia Brown</span>
          <span className="text-[9px] text-muted-foreground/70">aliciab</span>
        </div>
      </div>

      {/* 1st Place */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="size-24 md:size-32 border-4 border-primary bg-card shadow-[0_0_50px_-12px_hsl(var(--primary)/0.5)]">
            <AvatarFallback className="text-xl md:text-2xl font-black italic">JC</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-black uppercase shadow-lg">1</div>
        </div>
        <div className="text-center">
          <span className="text-xs font-black text-primary tracking-tight block">John Carter</span>
          <span className="text-[10px] text-primary/80">johncarter</span>
        </div>
      </div>

      {/* 3rd Place */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Avatar className="size-14 md:size-16 border-2 border-border/40 bg-card">
            <AvatarFallback className="text-xs md:text-sm font-black text-muted-foreground/40">RV</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-card border border-border/40 text-[8px] font-black shadow-sm">3</div>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-bold text-foreground/40 block">Ravi Verma</span>
          <span className="text-[9px] text-muted-foreground/60">raviv</span>
        </div>
      </div>
    </div>

    {/* Leaderboard Table Mock */}
    <Card className="w-full bg-card/60 backdrop-blur-sm border-border/40 overflow-hidden shadow-2xl">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="border-border/10">
            <TableHead className="text-[9px] font-black uppercase tracking-widest pl-6">Rank</TableHead>
            <TableHead className="text-[9px] font-black uppercase tracking-widest">Player</TableHead>
            <TableHead className="text-[9px] font-black uppercase tracking-widest text-center">Score</TableHead>
            <TableHead className="text-[9px] font-black uppercase tracking-widest text-right pr-6">Verdict</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ARENA_RESULTS.map((player) => (
            <TableRow key={player.rank} className="border-border/5">
              <TableCell className="pl-6 py-4"><Badge variant="outline" className="text-[10px] font-black border-border/40">{player.rank}</Badge></TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] font-bold text-foreground/85">{player.name}</span>
                  <span className="text-[9px] text-muted-foreground/70">{player.username}</span>
                </div>
              </TableCell>
              <TableCell className="text-center font-mono text-[11px] font-black py-4 tabular-nums text-primary">{player.score}</TableCell>
              <TableCell className="text-right pr-6 py-4">
                <div className="flex justify-end">
                   <VerdictBadge verdict={player.verdict} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  </Card>
);
