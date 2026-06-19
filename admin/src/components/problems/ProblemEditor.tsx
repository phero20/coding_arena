import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Save, FileJson } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProblemMutations, useProblemAdmin } from "@/hooks/useProblems";
import { QueryState } from "@/components/ui/query-state";
import { BasicInfoTab } from "./editor-tabs/BasicInfoTab";
import { ContentTab } from "./editor-tabs/ContentTab";
import { ExamplesRulesTab } from "./editor-tabs/ExamplesRulesTab";
import { ExecutionTab } from "./editor-tabs/ExecutionTab";

interface ProblemEditorProps {
  id?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProblemEditor({ id, onSuccess, onCancel }: ProblemEditorProps) {
  const { createProblem, updateProblem, isCreating, isUpdating } =
    useProblemMutations();
  const { data: initialData, isLoading, isError, error } = useProblemAdmin(id);

  const [jsonImportOpen, setJsonImportOpen] = useState(false);
  const [jsonImportText, setJsonImportText] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    problem_id: "",
    problem_slug: "",
    difficulty: "Easy",
    problem_type: "function",
    description: "",
    topics: "",
    is_premium: false,
    constraints: [] as string[],
    hints: [] as string[],
    follow_ups: [] as string[],
    examples: [] as any[],
    code_snippets: "{}",
    judging_policy: "{}",
    class_signature: "{}",
    function_signature:
      '{\n  "name": "exampleFunction",\n  "return_type": "int",\n  "params": []\n}',
    solutions: "",
  });

  useEffect(() => {
    if (!initialData) return;

    const rawData = initialData as any;
    const data = rawData.data ? rawData.data : rawData;
    // Safely extract difficulty
    let parsedDifficulty = "Easy";
    const dbDiff = (data.difficulty || "").trim().toLowerCase();
    if (dbDiff === "medium") parsedDifficulty = "Medium";
    if (dbDiff === "hard") parsedDifficulty = "Hard";

    setFormData({
      title: data.title || "",
      problem_id: data.problem_id || "",
      problem_slug: data.problem_slug || "",
      difficulty: parsedDifficulty,
      problem_type: data.problem_type || "function",
      description: data.description || "",
      topics: Array.isArray(data.topics) ? data.topics.join(", ") : "",
      is_premium: !!data.is_premium,
      constraints: Array.isArray(data.constraints) ? data.constraints : [],
      hints: Array.isArray(data.hints) ? data.hints : [],
      follow_ups: Array.isArray(data.follow_ups) ? data.follow_ups : [],
      examples: data.examples || [],
      code_snippets: data.code_snippets
        ? JSON.stringify(data.code_snippets, null, 2)
        : "{}",
      judging_policy: data.judging_policy
        ? JSON.stringify(data.judging_policy, null, 2)
        : "{}",
      class_signature: data.class_signature
        ? JSON.stringify(data.class_signature, null, 2)
        : "{}",
      function_signature: data.function_signature
        ? JSON.stringify(data.function_signature, null, 2)
        : "{}",
      solutions:
        typeof data.solutions === "string"
          ? data.solutions
          : data.solutions
            ? JSON.stringify(data.solutions, null, 2)
            : "",
    });
  }, [initialData]);

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [
        ...formData.examples,
        { example_num: formData.examples.length + 1, example_text: "" },
      ],
    });
  };

  const removeExample = (index: number) => {
    setFormData({
      ...formData,
      examples: formData.examples.filter((_, i) => i !== index),
    });
  };

  const updateExample = (index: number, text: string) => {
    const newExamples = [...formData.examples];
    newExamples[index].example_text = text;
    setFormData({ ...formData, examples: newExamples });
  };

  const addConstraint = () => {
    setFormData({ ...formData, constraints: [...formData.constraints, ""] });
  };

  const updateConstraint = (index: number, text: string) => {
    const newConstraints = [...formData.constraints];
    newConstraints[index] = text;
    setFormData({ ...formData, constraints: newConstraints });
  };

  const removeConstraint = (index: number) => {
    setFormData({
      ...formData,
      constraints: formData.constraints.filter((_, i) => i !== index),
    });
  };

  const addHint = () => {
    setFormData({ ...formData, hints: [...formData.hints, ""] });
  };

  const updateHint = (index: number, text: string) => {
    const newHints = [...formData.hints];
    newHints[index] = text;
    setFormData({ ...formData, hints: newHints });
  };

  const removeHint = (index: number) => {
    setFormData({
      ...formData,
      hints: formData.hints.filter((_, i) => i !== index),
    });
  };

  const addFollowUp = () => {
    setFormData({ ...formData, follow_ups: [...formData.follow_ups, ""] });
  };

  const updateFollowUp = (index: number, text: string) => {
    const newFollowUps = [...formData.follow_ups];
    newFollowUps[index] = text;
    setFormData({ ...formData, follow_ups: newFollowUps });
  };

  const removeFollowUp = (index: number) => {
    setFormData({
      ...formData,
      follow_ups: formData.follow_ups.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parse JSON and comma-separated fields
    let parsedFunctionSignature = undefined;
    let parsedClassSignature = undefined;
    let parsedCodeSnippets = undefined;
    let parsedJudgingPolicy = undefined;

    try {
      if (
        formData.function_signature &&
        formData.function_signature.trim() !== "{}"
      ) {
        parsedFunctionSignature = JSON.parse(formData.function_signature);
      }
      if (
        formData.class_signature &&
        formData.class_signature.trim() !== "{}"
      ) {
        parsedClassSignature = JSON.parse(formData.class_signature);
      }
      if (formData.code_snippets && formData.code_snippets.trim() !== "{}") {
        parsedCodeSnippets = JSON.parse(formData.code_snippets);
      }
      if (formData.judging_policy && formData.judging_policy.trim() !== "{}") {
        parsedJudgingPolicy = JSON.parse(formData.judging_policy);
      }
    } catch (err) {
      alert(
        "Invalid JSON in one of the signature/policy/snippet fields. Please fix it before saving.",
      );
      return;
    }

    const payload = {
      title: formData.title,
      problem_id: formData.problem_id,
      problem_slug: formData.problem_slug,
      difficulty: formData.difficulty as "Easy" | "Medium" | "Hard",
      problem_type: formData.problem_type as
        | "function"
        | "class"
        | "interactive",
      description: formData.description,
      topics: formData.topics
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      is_premium: formData.is_premium,
      constraints: formData.constraints.map((t) => t.trim()).filter(Boolean),
      hints: formData.hints.map((t) => t.trim()).filter(Boolean),
      follow_ups: formData.follow_ups.map((t) => t.trim()).filter(Boolean),
      examples: formData.examples.map((ex, idx) => ({
        ...ex,
        example_num: idx + 1,
      })),
      code_snippets: parsedCodeSnippets,
      judging_policy: parsedJudgingPolicy,
      class_signature: parsedClassSignature,
      function_signature: parsedFunctionSignature,
      solutions: formData.solutions,
    };

    try {
      if (initialData && id) {
        await updateProblem({ id: id, payload });
      } else {
        await createProblem(payload);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  const handleJsonImport = () => {
    try {
      const data = JSON.parse(jsonImportText);
      let parsedDifficulty = "Easy";
      const dbDiff = (data.difficulty || "").trim().toLowerCase();
      if (dbDiff === "medium") parsedDifficulty = "Medium";
      if (dbDiff === "hard") parsedDifficulty = "Hard";

      setFormData({
        ...formData,
        title: data.title || formData.title,
        problem_id: data.problem_id || formData.problem_id,
        problem_slug: data.problem_slug || formData.problem_slug,
        difficulty: parsedDifficulty,
        problem_type: data.problem_type || "function",
        description: data.description || "",
        topics: Array.isArray(data.topics) ? data.topics.join(", ") : "",
        is_premium: !!data.is_premium,
        constraints: Array.isArray(data.constraints) ? data.constraints : [],
        hints: Array.isArray(data.hints) ? data.hints : [],
        follow_ups: Array.isArray(data.follow_ups) ? data.follow_ups : [],
        examples: data.examples || [],
        code_snippets: data.code_snippets
          ? JSON.stringify(data.code_snippets, null, 2)
          : "{}",
        judging_policy: data.judging_policy
          ? JSON.stringify(data.judging_policy, null, 2)
          : "{}",
        class_signature: data.class_signature
          ? JSON.stringify(data.class_signature, null, 2)
          : "{}",
        function_signature: data.function_signature
          ? JSON.stringify(data.function_signature, null, 2)
          : "{}",
        solutions:
          typeof data.solutions === "string"
            ? data.solutions
            : data.solutions
              ? JSON.stringify(data.solutions, null, 2)
              : "",
      });
      setJsonImportOpen(false);
      setJsonImportText("");
    } catch (e) {
      alert("Invalid JSON format!");
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <QueryState
      isLoading={isLoading}
      loadingMessage="Loading problem details for editing..."
      isError={isError}
      error={error}
      errorTitle="Failed to load problem"
    >
      {id && !initialData ? (
        <div className="space-y-4">
          <p className="text-destructive font-medium">Problem not found.</p>
          <Button onClick={onCancel}>Go Back</Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full min-h-0 space-y-4 p-1"
        >
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
                  {initialData
                    ? `Edit Problem: ${formData.problem_slug || formData.title || "..."}`
                    : "Create New Problem"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {initialData
                    ? `Update the configuration and details for this problem.`
                    : `Create a new coding challenge.`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Dialog open={jsonImportOpen} onOpenChange={setJsonImportOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 px-4"
                    size="lg"
                  >
                    <FileJson className="w-4 h-4" />
                    JSON Import
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>Import Problem from JSON</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-2 flex flex-col min-h-[400px]">
                    <Label>Paste JSON Configuration</Label>
                    <Textarea
                      value={jsonImportText}
                      onChange={(e) => setJsonImportText(e.target.value)}
                      className="font-mono text-xs flex-1 min-h-[400px] bg-muted/20"
                      placeholder='{\n  "title": "Two Sum",\n  "problem_id": "1",\n  ...\n}'
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setJsonImportOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleJsonImport}>Import Data</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="gap-2 px-4"
              >
                <Save className="w-4 h-4" />
                {isPending
                  ? "Saving..."
                  : initialData
                    ? "Save Changes"
                    : "Create Problem"}
              </Button>
            </div>
          </div>

          <div className="rounded-md border bg-muted/10 p-4 md:p-6 flex-1 overflow-auto min-h-0">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="mb-6 bg-transparent p-0 flex flex-wrap gap-2 h-auto">
                <TabsTrigger
                  value="basic"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none border border-transparent data-[state=active]:border-primary/20 px-4 py-2"
                >
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none border border-transparent data-[state=active]:border-primary/20 px-4 py-2"
                >
                  Content & Solutions
                </TabsTrigger>
                <TabsTrigger
                  value="examples_rules"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none border border-transparent data-[state=active]:border-primary/20 px-4 py-2"
                >
                  Examples & Rules
                </TabsTrigger>
                <TabsTrigger
                  value="execution"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none border border-transparent data-[state=active]:border-primary/20 px-4 py-2"
                >
                  Execution Config
                </TabsTrigger>
              </TabsList>

              {/* BASIC INFO TAB */}
              <TabsContent value="basic" className="space-y-6">
                <BasicInfoTab formData={formData} setFormData={setFormData} />
              </TabsContent>

              {/* CONTENT TAB */}
              <TabsContent value="content" className="space-y-6">
                <ContentTab formData={formData} setFormData={setFormData} />
              </TabsContent>

              {/* EXAMPLES & RULES TAB */}
              <TabsContent value="examples_rules" className="space-y-8">
                <ExamplesRulesTab
                  formData={formData}
                  setFormData={setFormData}
                  addConstraint={addConstraint}
                  updateConstraint={updateConstraint}
                  removeConstraint={removeConstraint}
                  addHint={addHint}
                  updateHint={updateHint}
                  removeHint={removeHint}
                  addFollowUp={addFollowUp}
                  updateFollowUp={updateFollowUp}
                  removeFollowUp={removeFollowUp}
                  addExample={addExample}
                  updateExample={updateExample}
                  removeExample={removeExample}
                />
              </TabsContent>

              {/* EXECUTION CONFIG TAB */}
              <TabsContent value="execution" className="space-y-6">
                <ExecutionTab formData={formData} setFormData={setFormData} />
              </TabsContent>
            </Tabs>
          </div>
        </form>
      )}
    </QueryState>
  );
}
