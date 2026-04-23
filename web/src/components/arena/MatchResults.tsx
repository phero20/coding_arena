import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn, formatSolveTime } from "@/lib/utils";
import { ArenaPlayerResult } from "@/services/arena.service";
import {
  LogOut,
  Trophy,
  Eye,
  Code2,
  Terminal,
  Info,
  ChevronRight,
  Timer,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface MatchResultsProps {
  rankings: ArenaPlayerResult[];
  isHost: boolean;
  onClose: () => void;
}


export function MatchResults({ rankings, isHost, onClose }: MatchResultsProps) {
  const [expandedUser, setExpandedUser] = React.useState<string | undefined>(
    undefined,
  );

  const sortedRankings = React.useMemo(() => {
    return [...rankings].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      
      // Speed tie-breaker
      const aTime = a.timeTaken ?? Infinity;
      const bTime = b.timeTaken ?? Infinity;
      if (aTime !== bTime) return aTime - bTime;

      if (a.submissionOrder && b.submissionOrder)
        return a.submissionOrder - b.submissionOrder;
      if (a.submissionOrder) return -1;
      if (b.submissionOrder) return 1;
      return 0;
    });
  }, [rankings]);

  const topThree = sortedRankings.slice(0, 3);

  const getVerdictBadge = (verdict: string) => {
    const isAccepted = verdict === "ACCEPTED";
    return (
      <Badge
        variant="secondary"
        className={cn(
          "text-[9px] md:text-[10px] font-bold uppercase tracking-wider border-none whitespace-nowrap",
          isAccepted
            ? "bg-emerald-500/10 text-emerald-500"
            : "bg-destructive/10 text-destructive",
        )}
      >
        {verdict.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="h-screen flex flex-col items-center w-full max-w-4xl mx-auto px-0 py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="w-full flex items-center justify-between py-2 border-b border-border/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20">
            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl text-secondary font-black tracking-tight uppercase italic">
            Final Standings
          </h1>
        </div>

        <Button variant="destructive" size="sm" onClick={onClose}>
          <LogOut className="size-4 mr-2" /> <span>Exit Arena</span>
        </Button>
      </div>

      {/* Podium Section */}
      <div className="flex flex-row items-center justify-center gap-2 w-full max-w-3xl">
        {topThree[1] && (
          <div className="order-1">
            <PodiumProfile
              player={topThree[1]}
              rank={2}
              size="md"
              onExpand={setExpandedUser}
            />
          </div>
        )}
        {topThree[0] && (
          <div className="order-2">
            <PodiumProfile
              player={topThree[0]}
              rank={1}
              size="lg"
              onExpand={setExpandedUser}
            />
          </div>
        )}
        {topThree[2] && (
          <div className="order-3">
            <PodiumProfile
              player={topThree[2]}
              rank={3}
              size="sm"
              onExpand={setExpandedUser}
            />
          </div>
        )}
      </div>

      {/* Results List (Accordion Style - Practice History Match) */}
      <div className="w-full space-y-4">
        <Accordion
          type="single"
          collapsible
          value={expandedUser}
          onValueChange={setExpandedUser}
          className="w-full space-y-3"
        >
          {sortedRankings.map((player, index) => {
            const isWinner = index === 0;
            return (
              <AccordionItem
                key={player.userId}
                value={player.userId}
                className={cn(
                  "border border-border/40 bg-muted/20 rounded-xl px-1 overflow-hidden transition-all data-[state=open]:border-primary/40 hover:border-primary/20",
                  isWinner && "border-primary/20 bg-primary/5",
                )}
              >
                <AccordionTrigger className="px-5 py-4 hover:no-underline [&>svg]:hidden group" disabled={!player.sourceCode}>
                  <div className="flex w-full items-center justify-between pr-2">
                    <div className="flex items-center gap-4">
                      {/* Rank Indicator */}
                      <Badge className="">
                        {index + 1}
                      </Badge>

                      <div className="flex items-center gap-3">
                        <Avatar className="size-8 md:size-9 border-2 border-background shadow-md shrink-0">
                          <AvatarImage src={player.avatarUrl} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                            {player.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start gap-0 min-w-0">
                          <span className="text-xs md:text-sm font-bold tracking-tight truncate">
                            {player.username}
                          </span>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter">
                              {player.testsPassed}/{player.totalTests} Tests
                            </p>
                            {player.timeTaken && (
                              <>
                                <span className="text-[8px] text-muted-foreground/30">•</span>
                                <div className="flex items-center gap-0.5 text-[9px] font-black text-primary/60 uppercase tracking-tighter">
                                  <Timer className="size-2.5" />
                                  {formatSolveTime(player.timeTaken)}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      {getVerdictBadge(player.verdict)}
                      <Button
                        disabled={!player.sourceCode}
                        className={cn(
                          "flex items-center justify-center size-8 rounded-full transition-all",
                          player.sourceCode
                            ? "text-primary/40 group-hover:text-primary  group-data-[state=open]:text-primary"
                            : "text-muted-foreground/10",
                        )}
                      >
                        <Button size="sm">Code</Button>
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="border-t border-border/10 bg-muted/5 p-0">
                  {!player.sourceCode ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
                      <Eye className="size-8 mb-2" />
                      <p className="text-[10px] font-black uppercase italic">
                        Code not available yet
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="relative">
                        <SyntaxHighlighter
                          language={player.languageId || "javascript"}
                          style={vscDarkPlus}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            padding: "1.5rem",
                            fontSize: "0.75rem",
                            lineHeight: "1.8",
                            background: "transparent",
                            overflowX: "hidden",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                          }}
                          codeTagProps={{
                            style: {
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-all",
                              display: "block",
                              maxWidth: "100%",
                            },
                          }}
                        >
                          {player.sourceCode}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}

function PodiumProfile({
  player,
  rank,
  size,
  onExpand,
}: {
  player: ArenaPlayerResult;
  rank: number;
  size: "sm" | "md" | "lg";
  onExpand: (userId: string) => void;
}) {
  const sizes = {
    sm: "size-14 md:size-20",
    md: "size-16 md:size-24",
    lg: "size-24 md:size-32 border-primary",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 md:gap-3 shrink-0",
        rank === 1 ? "mb-0 md:mb-6" : "mb-0",
      )}
    >
      <div
        className="relative group cursor-pointer"
        onClick={() => onExpand(player.userId)}
      >
        <Avatar
          className={cn(
            "border-4 border-card shadow-2xl transition-all group-hover:scale-105 group-hover:border-primary/50",
            sizes[size],
          )}
        >
          <AvatarImage src={player.avatarUrl} />
          <AvatarFallback className="text-lg md:text-xl font-black italic">
            {player.username.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black z-10 shadow-lg",
            rank === 1
              ? "bg-primary text-primary-foreground"
              : "bg-card text-foreground border",
          )}
        >
          {rank}
        </div>
      </div>
      <div className="text-center max-w-[120px] flex flex-col items-center gap-1">
        <p className="font-bold text-xs md:text-sm truncate w-full tracking-tight">
          {player.username}
        </p>
        {player.timeTaken && (
          <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
            <Timer className="size-3" />
            {formatSolveTime(player.timeTaken)}
          </div>
        )}
      </div>
    </div>
  );
}
