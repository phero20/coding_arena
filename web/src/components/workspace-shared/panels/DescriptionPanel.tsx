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
  PenLine,
  X,
  Edit,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useWorkspaceTabs } from "@/hooks/workspace/use-workspace-tabs";
import { useUserSubmissionsQuery } from "@/hooks/queries/use-submission.queries";
import { OpponentsPanel } from "./OpponentsPanel";
import { SolutionViewer } from "../solutions/SolutionViewer";
import { SubmissionHistory } from "./SubmissionHistory";
import type { DescriptionPanelProps } from "@/types/component.types";
import { Button } from "@/components/ui/button";
import { SolutionEditor } from "../solutions/SolutionEditor";
import { QueryGuard } from "@/components/shared/QueryGuard";
import {
  useWorkspaceStore,
  MainTab,
} from "@/store/workspace/use-workspace-store";
import { useWorkspaceSync } from "@/hooks/workspace/use-workspace-sync";

const difficultyColor: Record<Problem["difficulty"], string> = {
  Easy: "text-difficulty-easy border-difficulty-easy bg-difficulty-easy",
  Medium:
    "text-difficulty-medium border-difficulty-medium bg-difficulty-medium",
  Hard: "text-difficulty-hard border-difficulty-hard bg-difficulty-hard",
};

export const DescriptionPanel = React.memo(
  ({ problem, mode = "practice", room, roomId }: DescriptionPanelProps) => {
    // 1. Sync Tabs with URL and Zustand
    useWorkspaceSync();
    const {
      mainTab: activeTab,
      setMainTab: setActiveTab,
      setSolTab,
      reset,
    } = useWorkspaceStore();

    const [showEditor, setShowEditor] = React.useState(false);

    // 2. Smart Reset: Clear workspace state when switching problems,
    // but ONLY if we are not landing on a deep link (?tab=...)
    React.useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const hasDeepLink = params.has("tab");
      
      if (!hasDeepLink) {
        reset();
      }
    }, [problem.problem_id, reset]);

    const cleanedDescription = React.useMemo(() => {
      if (!problem.description) return "";
      return problem.description
        .replace(/(?:<p>)?<strong>Example\s*\d+:?[\s\S]*$/i, "")
        .replace(/(?:<p>)?Example\s*\d+:?[\s\S]*$/i, "")
        .replace(/(?:<p>)?<strong>Constraints:?[\s\S]*$/i, "")
        .replace(/(?:<p>)?Constraints:?[\s\S]*$/i, "")
        .trim();
    }, [problem.description]);

    const {
      data: submissions,
      isLoading: isSubmissionsLoading,
      error: submissionsError,
      refetch: refetchSubmissions,
    } = useUserSubmissionsQuery(problem.problem_id);

    const tabs = useWorkspaceTabs(mode);

    return (
      <div className="flex flex-col bg-card/10 w-full h-full overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as MainTab)}
          className="flex-1 flex flex-col h-full overflow-hidden"
        >
          <div className="sticky top-0 z-20 px-4 bg-background md:bg-muted/20 border-b border-border/20 overflow-x-auto no-scrollbar">
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
                  <tab.icon className="size-4" />
                  <span className="hidden lg:inline-block">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 relative">
            <ScrollArea className="h-full">
              <TabsContent
                value="description"
                className="m-0 border-none outline-none"
              >
                <div className="p-4 md:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <header className="py-4 border-b border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-xl font-bold tracking-tight text-foreground/90">
                        {problem.problem_id}. {problem.title}
                      </h1>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-none text-[10px] font-black uppercase tracking-widest",
                          difficultyColor[problem.difficulty],
                        )}
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
                    className="text-sm leading-relaxed text-foreground/80 prose prose-invert max-w-full wrap-break-word pb-4"
                    dangerouslySetInnerHTML={{ __html: cleanedDescription }}
                  />

                  {/* Examples */}
                  {problem.examples && problem.examples.length > 0 && (
                    <div className="space-y-12">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-foreground/90">
                        <Lightbulb className="size-4 text-primary" />
                        Examples
                      </h3>
                      {problem.examples.map((example, idx) => (
                        <div key={idx} className="space-y-3">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Example {example.example_num}
                          </p>

                          {example.images && example.images.length > 0 && (
                            <div className="flex flex-wrap gap-4 mb-3">
                              {example.images.map((imgUrl, imgIdx) => (
                                <Card
                                  key={imgIdx}
                                  className="overflow-hidden border-border/20"
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`Example ${example.example_num} visualization`}
                                    className="max-h-[300px] w-auto block object-contain"
                                  />
                                </Card>
                              ))}
                            </div>
                          )}

                          <Card className="w-full max-w-full p-4 rounded-lg bg-muted border border-border text-xs text-foreground/80 overflow-x-auto whitespace-pre-wrap break-all font-mono">
                            {example.example_text}
                          </Card>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Constraints */}
                  {problem.constraints && problem.constraints.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-border/10">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-foreground/90">
                        <HelpCircle className="size-4 text-primary" />
                        Constraints
                      </h3>
                      <ul className="space-y-2">
                        {problem.constraints.map((constraint, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed"
                          >
                            <div className="size-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                            <code className="bg-muted px-1 rounded text-foreground/90">
                              {constraint}
                            </code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="hints"
                className="m-0 border-none outline-none"
              >
                <div className="p-4 md:p-6">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-foreground/90 mb-6">
                    <Lightbulb className="size-4 text-primary" />
                    Problem Hints
                  </h3>
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full space-y-3"
                  >
                    {problem.hints?.map((hint, idx) => (
                      <AccordionItem
                        key={idx}
                        value={`hint-${idx}`}
                        className="border border-border/40 bg-muted/20 rounded-lg px-4 transition-all data-[state=open]:bg-muted/30"
                      >
                        <AccordionTrigger className="text-xs font-bold hover:no-underline py-4">
                          Hint {idx + 1}
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4 border-t border-border/10 pt-4">
                          {hint}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TabsContent>

              <TabsContent
                value="opponents"
                className="m-0 border-none outline-none"
              >
                {roomId && <OpponentsPanel roomId={roomId} />}
              </TabsContent>

              <TabsContent
                value="solutions"
                className="m-0 border-none outline-none"
              >
                <div className="relative">
                  {showEditor ? (
                    <div className="p-4 animate-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold flex items-center gap-2">
                          <PenLine className="size-4 text-primary" />
                          Write Solution
                        </h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEditor(false)}
                          className="size-8 p-0"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <SolutionEditor
                        problemId={problem.problem_id}
                        problemTitle={problem.title}
                        problemSlug={problem.problem_slug}
                        onSuccess={() => {
                          setShowEditor(false);
                          setSolTab("my-solutions");
                        }}
                      />
                    </div>
                  ) : (
                    <SolutionViewer
                      problemId={problem.problem_id}
                      problemTitle={problem.title}
                      problemSlug={problem.problem_slug}
                      officialSolution={problem.solutions}
                      onAddSolution={() => setShowEditor(true)}
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="submissions"
                className="m-0 border-none outline-none"
              >
                <div className="p-4 md:p-6">
                  <SubmissionHistory
                    submissions={submissions || []}
                    isLoading={isSubmissionsLoading}
                    error={submissionsError}
                    onRetry={refetchSubmissions}
                  />
                </div>
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    );
  },
);
