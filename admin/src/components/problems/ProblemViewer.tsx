import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useProblemAdmin } from "@/hooks/useProblems";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/ui/query-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, ChevronLeft, Code, Layout } from "lucide-react";

interface ProblemViewerProps {
  id: string;
  onBack: () => void;
}

export function ProblemViewer({ id, onBack }: ProblemViewerProps) {
  const { data: problem, isLoading, isError, error } = useProblemAdmin(id);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"ui" | "json">("ui");

  const fullProblem = problem as any; // Cast to access full backend fields if passed

  const handleCopy = () => {
    if (!fullProblem) return;
    navigator.clipboard.writeText(JSON.stringify(fullProblem, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <QueryState
      isLoading={isLoading}
      loadingMessage="Loading problem details..."
      isError={isError}
      error={error}
      errorTitle="Failed to load problem"
    >
      {!problem ? (
        <div className="space-y-4">
          <p className="text-destructive font-medium">Problem not found.</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      ) : (
        <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
          <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="icon-lg" onClick={onBack} title="Go Back" className="gap-1 rounded-full shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div>
                <h3 className="text-lg font-medium tracking-tight">
                  Problem Information: {problem.problem_slug}
                </h3>
                <p className="text-sm text-muted-foreground">
                  ID: {problem.problem_id} | Title: {problem.title}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setViewMode(viewMode === "ui" ? "json" : "ui")} className="gap-2 px-4 shrink-0 hidden md:flex">
                {viewMode === "ui" ? <Code className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
                {viewMode === "ui" ? "JSON View" : "UI View"}
              </Button>
              <Button variant="outline" onClick={handleCopy} className="gap-2 px-4 shrink-0 ml-2 hidden md:flex">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy JSON"}
              </Button>
            </div>
          </div>

          <div className="rounded-md border bg-muted/10 p-4 md:p-6 flex-1 overflow-auto min-h-0">
            {viewMode === "json" ? (
              <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(fullProblem, null, 2)}
              </pre>
            ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-8">
                {/* Properties */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Properties</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={` ${
                      fullProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      fullProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {fullProblem.difficulty}
                    </Badge>
                    {fullProblem.problem_type && (
                      <Badge variant="outline" className="font-mono">
                        {fullProblem.problem_type}
                      </Badge>
                    )}
                    {fullProblem.is_premium && (
                      <Badge variant="secondary">
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Topics */}
                {problem.topics && problem.topics.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {problem.topics.map((topic: string) => (
                        <Badge key={topic} variant="outline" className="bg-muted/50">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            <div className="pt-4">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-6 bg-transparent p-0 flex flex-wrap gap-2 h-auto">
                  <TabsTrigger 
                    value="overview"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none border border-transparent data-[state=active]:border-primary/20 px-4 py-2"
                  >
                    Overview & Requirements
                  </TabsTrigger>
                  <TabsTrigger 
                    value="execution"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none border border-transparent data-[state=active]:border-primary/20 px-4 py-2"
                  >
                    Execution & Signatures
                  </TabsTrigger>
                  {fullProblem.solutions && (
                    <TabsTrigger 
                      value="solutions"
                      className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none border border-transparent data-[state=active]:border-primary/20 px-4 py-2"
                    >
                      Solutions
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-8 pb-8">
                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Description</h4>
                    <div className="p-4 bg-muted/20 border rounded-md">
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {fullProblem.description}
                      </pre>
                    </div>
                  </div>

                  {/* Examples */}
                  {fullProblem.examples && fullProblem.examples.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Examples</h4>
                      <div className="grid gap-4">
                        {fullProblem.examples.map((ex: any, idx: number) => (
                          <Card key={idx} className="shadow-none">
                            <CardContent className="p-4">
                              <p className="text-sm font-semibold mb-2">Example {ex.example_num || idx + 1}</p>
                              <pre className="whitespace-pre-wrap font-mono text-sm bg-muted/30 p-3 rounded border">
                                {ex.example_text}
                              </pre>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Constraints */}
                    {fullProblem.constraints && fullProblem.constraints.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Constraints</h4>
                        <ul className="list-disc space-y-1 text-sm bg-muted/10 p-4 pl-8 rounded-md border h-full">
                          {fullProblem.constraints.map((constraint: string, idx: number) => (
                            <li key={idx} className="font-mono break-words whitespace-pre-wrap">{constraint}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Hints */}
                    {fullProblem.hints && fullProblem.hints.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Hints</h4>
                        <ol className="list-decimal space-y-2 text-sm text-muted-foreground bg-muted/10 p-4 pl-8 rounded-md border h-full">
                          {fullProblem.hints.map((hint: string, idx: number) => (
                            <li key={idx} className="break-words whitespace-pre-wrap">{hint}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>

                  {/* Follow Ups */}
                  {fullProblem.follow_ups && fullProblem.follow_ups.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Follow Ups</h4>
                      <ul className="list-disc space-y-1 text-sm bg-primary/5 p-4 pl-8 rounded-md border border-primary/20 text-primary">
                        {fullProblem.follow_ups.map((followUp: string, idx: number) => (
                          <li key={idx} className="font-medium break-words whitespace-pre-wrap">{followUp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                {/* EXECUTION TAB */}
                <TabsContent value="execution" className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Function Signature */}
                    {fullProblem.function_signature && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Function Signature</h4>
                        <div className="p-4 bg-muted/30 rounded-md overflow-x-auto border">
                          <pre className="text-xs font-mono">
                            {JSON.stringify(fullProblem.function_signature, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Class Signature */}
                    {fullProblem.class_signature && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Class Signature</h4>
                        <div className="p-4 bg-muted/30 rounded-md overflow-x-auto border">
                          <pre className="text-xs font-mono">
                            {JSON.stringify(fullProblem.class_signature, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Code Snippets */}
                  {fullProblem.code_snippets && Object.keys(fullProblem.code_snippets).length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Code Snippets</h4>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger className="w-[180px] h-8 text-xs">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(fullProblem.code_snippets).map(lang => (
                              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-md overflow-x-auto border">
                        <pre className="text-xs font-mono">
                          {fullProblem.code_snippets[selectedLanguage] || 
                           fullProblem.code_snippets[Object.keys(fullProblem.code_snippets)[0]]}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Judging Policy */}
                  {fullProblem.judging_policy && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Judging Policy</h4>
                      <Card className="shadow-none">
                        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                          <div>
                            <span className="text-muted-foreground block text-xs mb-1 uppercase tracking-wider">Comparator</span>
                            <span className="font-mono bg-muted px-2 py-1 rounded text-xs">{fullProblem.judging_policy.comparator_mode || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-xs mb-1 uppercase tracking-wider">Output Order</span>
                            <span className="font-mono bg-muted px-2 py-1 rounded text-xs">{fullProblem.judging_policy.output_order || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-xs mb-1 uppercase tracking-wider">Validation</span>
                            <span className="font-mono bg-muted px-2 py-1 rounded text-xs">{fullProblem.judging_policy.validation_policy || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-xs mb-1 uppercase tracking-wider">Multi Answer</span>
                            <span className="font-mono bg-muted px-2 py-1 rounded text-xs">{fullProblem.judging_policy.multi_answer ? 'Yes' : 'No'}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                {/* SOLUTIONS TAB */}
                {fullProblem.solutions && (
                  <TabsContent value="solutions" className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Solutions Document</h4>
                    <div className="p-4 bg-muted/20 border rounded-md overflow-x-auto">
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {fullProblem.solutions}
                      </pre>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
            </div>
            )}
          </div>
        </div>
      )}
    </QueryState>
  );
}
