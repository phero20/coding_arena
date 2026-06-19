import { useState, useEffect } from "react";
import {
  useProblemTestsAdmin,
  useProblemTestMutations,
} from "@/hooks/useProblems";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Save, ChevronLeft } from "lucide-react";
import { QueryState } from "@/components/ui/query-state";
import { toast } from "sonner";

export function ProblemTestEditor({
  id,
  onSuccess,
  onCancel,
}: {
  id: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const {
    data: testsData,
    isLoading,
    isError,
    error,
  } = useProblemTestsAdmin(id);
  const { updateProblemTests, isUpdatingTests } = useProblemTestMutations();

  const [activeTab, setActiveTab] = useState("public");

  // local form state for the currently selected tab's test cases
  const [cases, setCases] = useState<any[]>([]);

  // When data loads or tab switches, reset cases state
  useEffect(() => {
    if (testsData) {
      const tabData = testsData.find((t: any) => t.type === activeTab);
      if (tabData && tabData.cases) {
        // map cases to stringified JSON for textareas
        setCases(
          tabData.cases.map((c: any) => ({
            ...c,
            input:
              typeof c.input === "string"
                ? c.input
                : JSON.stringify(c.input, null, 2),
            expected_output:
              typeof c.expected_output === "string"
                ? c.expected_output
                : JSON.stringify(c.expected_output, null, 2),
          })),
        );
      } else {
        setCases([]);
      }
    }
  }, [testsData, activeTab]);

  const handleSave = async () => {
    try {
      // parse strings back to JSON
      const parsedCases = cases.map((c) => {
        try {
          return {
            ...c,
            input: JSON.parse(c.input),
            expected_output: JSON.parse(c.expected_output),
          };
        } catch (e) {
          throw new Error(
            "Invalid JSON in input or expected_output fields. Please fix syntax errors.",
          );
        }
      });

      await updateProblemTests({
        id,
        payload: { type: activeTab, cases: parsedCases },
      });
      // We do not call onSuccess() here so they can keep editing, unless they want to close it.
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    }
  };

  const addCase = () => {
    setCases([
      ...cases,
      {
        input: "{\n  \n}",
        expected_output: "{\n  \n}",
        weight: 1,
        is_sample: false,
      },
    ]);
  };

  const removeCase = (index: number) => {
    setCases(cases.filter((_, i) => i !== index));
  };

  const updateCase = (index: number, field: string, value: any) => {
    const newCases = [...cases];
    newCases[index] = { ...newCases[index], [field]: value };
    setCases(newCases);
  };

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      error={error}
      loadingMessage="Loading test cases..."
    >
      <div className="flex flex-col h-full min-h-0 space-y-4">
        {/* FIXED HEADER */}
        <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-20 pt-4 -mt-4 shrink-0">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="secondary"
              size="icon-lg"
              onClick={onCancel}
              title="Go Back"
              className="gap-1 rounded-full shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div>
              <h3 className="text-lg font-medium tracking-tight">
                Edit Test Cases
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage public and hidden test cases for this problem.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handleSave}
              disabled={isUpdatingTests}
              className="gap-2 px-4"
              size="lg"
            >
              <Save className="w-4 h-4" /> Save {activeTab} Tests
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-auto min-h-0 "
        >
          <TabsList className="sticky top-0 z-10 mb-6 bg-background p-2 -mt-2 flex flex-wrap gap-2 h-auto rounded-none">
            <TabsTrigger
              value="public"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none border border-transparent data-[state=active]:border-primary/20 px-4 py-2"
            >
              Public
            </TabsTrigger>
            <TabsTrigger
              value="hidden"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none border border-transparent data-[state=active]:border-primary/20 px-4 py-2"
            >
              Hidden
            </TabsTrigger>
          </TabsList>
          <div className="space-y-8 pb-10">
            {cases.map((testCase, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-md space-y-6 bg-muted/10 relative group"
              >
                <div className="flex justify-between items-center w-full">
                  <Label className="text-muted-foreground text-xs font-semibold">
                    Test Case {idx + 1}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => removeCase(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col h-full">
                    <Label>Input (JSON)</Label>
                    <Textarea
                      className="font-mono text-xs flex-1 min-h-[250px] bg-muted/30"
                      value={testCase.input}
                      onChange={(e) => updateCase(idx, "input", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 flex flex-col h-full">
                    <Label>Expected Output (JSON)</Label>
                    <Textarea
                      className="font-mono text-xs flex-1 min-h-[250px] bg-muted/30"
                      value={testCase.expected_output}
                      onChange={(e) =>
                        updateCase(idx, "expected_output", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-border/50">
                  <div className="space-y-2 flex flex-col">
                    <Label>Weight</Label>
                    <Input
                      type="number"
                      value={testCase.weight}
                      onChange={(e) =>
                        updateCase(idx, "weight", Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label>Timeout (ms)</Label>
                    <Input
                      type="number"
                      placeholder="No limit"
                      value={testCase.timeout_ms || ""}
                      onChange={(e) =>
                        updateCase(
                          idx,
                          "timeout_ms",
                          Number(e.target.value) || undefined,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label>Memory Limit (MB)</Label>
                    <Input
                      type="number"
                      placeholder="No limit"
                      value={testCase.memory_limit_mb || ""}
                      onChange={(e) =>
                        updateCase(
                          idx,
                          "memory_limit_mb",
                          Number(e.target.value) || undefined,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      checked={testCase.is_sample}
                      onCheckedChange={(c) => updateCase(idx, "is_sample", c)}
                    />
                    <Label className="cursor-pointer">Is Sample Case?</Label>
                  </div>
                </div>
              </div>
            ))}

            {cases.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-dashed">
                No test cases found for {activeTab}.
              </div>
            )}

            <Button
              variant="outline"
              className="w-full border-dashed py-8"
              onClick={addCase}
            >
              <Plus className="h-4 w-4 mr-2" /> Add New Test Case
            </Button>
          </div>
        </Tabs>
      </div>
    </QueryState>
  );
}
