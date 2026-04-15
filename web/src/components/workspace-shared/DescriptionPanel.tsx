"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Problem } from "@/types/api";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Code2,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArenaRoom } from "@/services/arena.service";
import { useWorkspaceTabs } from "@/hooks/workspace/use-workspace-tabs";
import { useUserSubmissions } from "@/hooks/api/use-user-submissions";
import { OpponentsPanel } from "./OpponentsPanel";
import { SolutionViewer } from "./SolutionViewer";
import { SubmissionHistory } from "./SubmissionHistory";

interface DescriptionPanelProps {
  problem: Problem;
  mode?: "practice" | "arena";
  room?: ArenaRoom | null;
  currentUserId?: string | null;
  roomId?: string;
}

const difficultyColor: Record<Problem["difficulty"], string> = {
  Easy: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
  Medium: "text-amber-400 border-amber-500/30 bg-amber-500/5",
  Hard: "text-rose-400 border-rose-500/30 bg-rose-500/5",
};

export const DescriptionPanel = React.memo(
  ({
    problem,
    mode = "practice",
    room,
    currentUserId,
    roomId,
  }: DescriptionPanelProps) => {
    const {
      data: submissions,
      isLoading: isSubmissionsLoading,
      error: submissionsError,
    } = useUserSubmissions({
      problemId: problem.problem_id,
    });

    const tabs = useWorkspaceTabs(mode);

    return (
      <div className="flex flex-col bg-card/10 w-full max-w-full md:h-full md:overflow-hidden">
        <Tabs
          defaultValue="description"
          className="flex-1 flex flex-col md:h-full md:overflow-hidden"
        >
          <div className="sticky top-0 z-20 px-4 bg-background/95 md:bg-muted/20 backdrop-blur-md border-b border-border/20 overflow-x-auto no-scrollbar">
            <TabsList className="bg-transparent h-10 p-0 flex flex-wrap justify-start w-max min-w-full gap-4 sm:gap-6">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none",
                    "border-b-2 border-transparent data-[state=active]:border-primary",
                    "rounded-none h-10 px-0 text-xs font-bold transition-all flex items-center gap-2",
                  )}
                >
                  <tab.icon className="size-3.5" />
                  <span className="hidden lg:inline-block">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 min-h-0">
            <TabsContent
              value="description"
              className="h-full m-0 border-none outline-none data-[state=inactive]:hidden"
            >
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  <header className="p-4 border-b border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-xl font-bold tracking-tight text-foreground/90">
                        {problem.problem_id}. {problem.title}
                      </h1>
                      <Badge
                        variant="outline"
                        className={cn("", difficultyColor[problem.difficulty])}
                      >
                        {problem.difficulty}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {problem.topics.map((topic) => (
                        <Badge key={topic} className="">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </header>
                  <div
                    className="text-sm leading-relaxed text-foreground/80 prose prose-invert max-w-full wrap-break-word"
                    dangerouslySetInnerHTML={{ __html: problem.description }}
                  />

                  {problem.examples && problem.examples.length > 0 && (
                    <div className="w-full min-w-0 overflow-hidden space-y-12">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-foreground/90">
                        <Lightbulb className="size-4 text-primary" />
                        Examples
                      </h3>
                      {problem.examples.map((example, idx) => (
                        <div key={idx} className="w-full min-w-0 space-y-3">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Example {example.example_num}
                          </p>

                          {example.images && example.images.length > 0 && (
                            <div className="flex flex-wrap gap-4 mb-3">
                              {example.images.map((imgUrl, imgIdx) => (
                                <Card key={imgIdx} className="overflow-hidden">
                                  <img
                                    src={imgUrl}
                                    alt={`Example ${example.example_num} visualization ${imgIdx + 1}`}
                                    className="max-h-[300px] w-auto block object-contain"
                                  />
                                </Card>
                              ))}
                            </div>
                          )}

                          <Card className="w-full max-w-full p-4 rounded-lg bg-muted border border-border text-xs text-foreground/80 overflow-x-auto whitespace-pre-wrap break-all">
                            {example.example_text}
                          </Card>
                        </div>
                      ))}
                    </div>
                  )}

                  {problem.constraints && problem.constraints.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-foreground/90">
                        Constraints
                      </h3>
                      <ul className="list-disc list-inside space-y-1.5">
                        {problem.constraints.map((constraint, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-muted-foreground leading-relaxed"
                          >
                            <code className="px-1 py-0.5 rounded bg-muted/40 text-[10px]">
                              {constraint}
                            </code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="hints"
              className="h-full m-0 border-none outline-none data-[state=inactive]:hidden"
            >
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {!problem.hints || problem.hints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-50">
                      <HelpCircle className="size-12 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        No hints available for this problem.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="size-4 text-primary" />
                        <h3 className="text-sm font-bold text-foreground">
                          Hints
                        </h3>
                      </div>
                      <Accordion
                        type="single"
                        collapsible
                        className="w-full space-y-3"
                      >
                        {problem.hints.map((hint, idx) => (
                          <AccordionItem
                            key={idx}
                            value={`hint-${idx + 1}`}
                            className="border border-border/40 bg-muted/20 rounded-lg px-4 overflow-hidden transition-all data-[state=open]:border-primary/40 hover:border-primary/20"
                          >
                            <AccordionTrigger className="hover:no-underline py-4 text-xs font-bold text-foreground/90 uppercase tracking-widest">
                              Hint {idx + 1}
                            </AccordionTrigger>
                            <AccordionContent className="text-xs leading-relaxed text-muted-foreground pb-4 prose prose-invert max-w-full">
                              {hint}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {mode === "arena" && (
              <TabsContent
                value="opponents"
                className="h-full m-0 border-none outline-none data-[state=inactive]:hidden"
              >
                <OpponentsPanel roomId={roomId || room?.roomId || ""} />
              </TabsContent>
            )}

            {mode === "practice" && (
              <>
                <TabsContent
                  value="solutions"
                  className="h-full m-0 border-none outline-none data-[state=inactive]:hidden"
                >
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      <SolutionViewer content={problem.solutions} />
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent
                  value="submissions"
                  className="h-full m-0 border-none outline-none data-[state=inactive]:hidden"
                >
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      <SubmissionHistory
                        submissions={submissions || []}
                        isLoading={isSubmissionsLoading}
                        error={submissionsError}
                      />
                    </div>
                  </ScrollArea>
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    );
  },
);
