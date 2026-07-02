"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { workspaceMarkdownComponents } from "@/components/academy/editor/practice-markdown";
import { Problem } from "@/types/api";
import { cn } from "@/lib/utils";
import {
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  X,
  Edit,
  ExternalLink,
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
import { SolutionEditor } from "../solutions/SolutionEditor";
import { QueryGuard } from "@/components/shared/QueryGuard";
import {
  useWorkspaceStore,
  MainTab,
} from "@/store/workspace/use-workspace-store";
import { useWorkspaceSync } from "@/hooks/workspace/use-workspace-sync";
import { useUser } from "@clerk/nextjs";
import { useUserSolvedProblemsQuery } from "@/hooks/queries/use-problem.queries";
import { useSolvedExercisesQuery } from "@/hooks/queries/use-academy.queries";

const difficultyColor: Record<Problem["difficulty"], string> = {
  Easy: "text-difficulty-easy border-difficulty-easy bg-difficulty-easy",
  Medium:
    "text-difficulty-medium border-difficulty-medium bg-difficulty-medium",
  Hard: "text-difficulty-hard border-difficulty-hard bg-difficulty-hard",
};

export const DescriptionPanel = React.memo(
  ({ problem, mode = "practice", room, roomId, trackSlug }: DescriptionPanelProps) => {
    // 1. Sync Tabs with URL and Zustand
    useWorkspaceSync();
    const { user } = useUser();

    const {
      mainTab: activeTab,
      setMainTab: setActiveTab,
      setSolTab,
      reset,
    } = useWorkspaceStore();

    const [showEditor, setShowEditor] = React.useState(false);
    const [localTab, setLocalTab] = React.useState<string>(activeTab);

    // Sync localTab with store's activeTab when it changes from outside (e.g. URL)
    React.useEffect(() => {
      setLocalTab(activeTab);
    }, [activeTab]);

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
      // Exercise mode: raw Markdown — don't strip HTML tags, pass as-is
      if (mode === "exercise") return problem.description;
      // Practice/Arena mode: HTML content — strip example/constraints sections at the end
      return problem.description
        .replace(/(\n|<br\s*\/?>|<\/?p>|^)\s*(?:<strong>|<b>)?(?:Example\s*\d*|Constraints)\s*(?:<\/strong>|<\/b>)?\s*:[\s\S]*$/i, "")
        .trim();
    }, [problem.description, mode]);

    const {
      data: submissions,
      isLoading: isSubmissionsLoading,
      error: submissionsError,
      refetch: refetchSubmissions,
    } = useUserSubmissionsQuery(problem.problem_id, !!user);

    const tabs = useWorkspaceTabs(mode);

    const handleTabChange = (val: string) => {
      setLocalTab(val);
      // Only sync permanent tabs to the URL/Store
      if (val !== "new-solution") {
        setActiveTab(val as MainTab);
      }
    };

    // Unconditionally call hooks, use enabled/args to control fetching
    const { data: solvedExercises = [] } = useSolvedExercisesQuery(
      mode === "exercise" ? trackSlug || "" : ""
    );
    const { data: solvedProblems = [] } = useUserSolvedProblemsQuery(
      user?.id,
      mode !== "exercise"
    );

    const isSolved = mode === "exercise"
      ? solvedExercises.includes(problem.problem_slug)
      : solvedProblems.includes(problem.problem_id);

    return (
      <div className="flex flex-col bg-card/10 w-full h-full overflow-hidden">
        <Tabs
          value={localTab}
          onValueChange={handleTabChange}
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
                  <span className="hidden xl:inline-block">{tab.label}</span>
                </TabsTrigger>
              ))}

              {showEditor && (
                <TabsTrigger
                  value="new-solution"
                  className={cn(
                    "data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none",
                    "border-b-2 border-transparent data-[state=active]:border-primary",
                    "rounded-none h-10 px-0 text-xs font-bold transition-all flex items-center gap-2 animate-in slide-in-from-left-2 group",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Edit className="size-4" />
                    <span className="hidden lg:inline-block">New Solution</span>
                  </div>
                  <Badge
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditor(false);
                      setLocalTab("solutions");
                    }}
                    variant="destructive"
                    className="p-1 bg-transparent"
                  >
                    <X className="size-4" />
                  </Badge>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 relative">
            <ScrollArea className="h-full w-full overflow-x-hidden">
              <TabsContent
                value="description"
                className="m-0 border-none outline-none"
              >

                <div className="p-4 md:px-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 min-w-0 w-full overflow-hidden">

                  <header className="py-4 border-b border-border/40">

                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-xl font-bold tracking-tight text-foreground/90 flex items-center gap-2">
                        {mode === "exercise" ? (
                          <img width={100} height={100}
                            src={`/assets/practice-icon/${trackSlug}/${problem.problem_slug}.svg`}
                            alt={`${problem.title} icon`}
                            className="w-14 object-contain"
                          />
                        ) : (
                          `${problem.problem_id}. `
                        )}
                        {problem.title}
                      </h1>
                      <div className="flex flex-col flex-wrap lg:flex-row gap-1 items-center justify-center">
                        {
                          mode == "exercise" && problem.difficulty ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                "border-none text-[10px] font-black uppercase tracking-widest",
                                difficultyColor["Medium"],
                              )}
                            >
                              Level {problem.difficulty}
                            </Badge>
                          ) : (<Badge
                            variant="outline"
                            className={cn(
                              "border-none text-[10px] font-black uppercase tracking-widest",
                              difficultyColor[problem.difficulty],
                            )}
                          >
                            {problem.difficulty}
                          </Badge>
                          )
                        }
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "border-none text-[10px] font-black uppercase tracking-widest cursor-pointer",
                                  isSolved && "text-difficulty-easy"
                                )}
                              >
                                {
                                  mode == "exercise" ? (
                                    "10 Points"
                                  ) : (
                                    problem.difficulty == 'Easy' ? "10 Points" : problem.difficulty == 'Medium' ? "30 Points" : problem.difficulty == 'Hard' ? "50 Points" : "10 Points"
                                  )
                                }
                                {isSolved && <CheckCircle2 className="ml-1 h-3 w-3 inline-block" />}
                              </Badge>
                            </TooltipTrigger>

                            <TooltipContent side="top">
                              {isSolved ? <p>Already solved and earned {mode === "exercise" ? "10" : problem.difficulty === "Hard" ? "50" : problem.difficulty === "Medium" ? "30" : "10"} points.</p> :
                                <p>Solve this problem to earned {mode === "exercise" ? "10" : problem.difficulty === "Hard" ? "50" : problem.difficulty === "Medium" ? "30" : "10"} points.</p>
                              }

                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>


                    </div>
                    <div className="flex flex-wrap gap-2">
                      {problem.topics.map((topic) => (
                        <Badge key={topic} className="">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </header>
                  {mode === "exercise" ? (
                    <>
                      <div className="text-sm leading-relaxed text-foreground/80  max-w-none w-full min-w-0 overflow-hidden pb-2">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={workspaceMarkdownComponents}
                        >
                          {cleanedDescription}
                        </ReactMarkdown>
                      </div>

                      {problem.source && (
                        <div className="py-4 border-t border-border/60">
                          <h3 className="text-sm font-bold text-foreground mb-3">
                            Source
                          </h3>
                          <p className="text-sm">
                            {problem.source_url ? (
                              <a
                                href={problem.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium inline-flex items-center gap-1.5"
                              >
                                {problem.source?.replace(/exercism's/gi, "SlaveCode's").replace(/exercism/gi, "SlaveCode")}
                                <ExternalLink className="size-3.5 opacity-70" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">
                                {problem.source?.replace(/exercism's/gi, "SlaveCode's").replace(/exercism/gi, "SlaveCode")}
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div
                      className="text-sm leading-relaxed text-foreground/80 prose prose-invert max-w-full wrap-break-word pb-4"
                      dangerouslySetInnerHTML={{ __html: cleanedDescription }}
                    />
                  )}

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
                                  <img width={100} height={100}
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

                  {/* Follow Ups */}
                  {problem.follow_ups && problem.follow_ups.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-border/10">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-foreground/90">
                        <Lightbulb className="size-4 text-primary" />
                        Follow Up
                      </h3>
                      <ul className="space-y-2">
                        {problem.follow_ups.map((followUp, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed font-medium"
                          >
                            <div className="size-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                            <span className="text-foreground/90">{followUp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Source Attribution */}

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
                  <QueryGuard
                    loading={false}
                    error={null}
                    data={problem.hints}
                    emptyTitle="No Hints Available"
                    emptyMessage="There are no hints provided for this problem. You've got this!"
                  >
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
                          <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4 border-t border-border/60 pt-4">
                            {mode === "exercise" ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none w-full">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={workspaceMarkdownComponents}
                                >
                                  {hint?.replace(/exercism's/gi, "SlaveCode's").replace(/exercism/gi, "SlaveCode")}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              hint
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </QueryGuard>
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
                <SolutionViewer
                  problemId={problem.problem_id}
                  problemTitle={problem.title}
                  problemSlug={problem.problem_slug}
                  officialSolution={problem.solutions}
                  mode={mode}
                  trackSlug={trackSlug}
                  onAddSolution={() => {
                    setShowEditor(true);
                    setLocalTab("new-solution");
                  }}
                />
              </TabsContent>

              {showEditor && (
                <TabsContent
                  value="new-solution"
                  className="m-0 border-none outline-none animate-in slide-in-from-right-4 duration-300"
                >
                  <div className="">
                    <SolutionEditor
                      problemId={problem.problem_id}
                      problemTitle={problem.title}
                      problemSlug={problem.problem_slug}
                      onSuccess={() => {
                        setShowEditor(false);
                        setSolTab("my-solutions");
                        setLocalTab("solutions");
                      }}
                    />
                  </div>
                </TabsContent>
              )}

              <TabsContent
                value="submissions"
                className="m-0 border-none outline-none"
              >
                <div>
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
