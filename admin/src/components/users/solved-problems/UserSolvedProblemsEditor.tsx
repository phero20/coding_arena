import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserSolvedProblemsAdmin } from "@/hooks/useUserAdmin";
import { Loader2, ChevronLeft, Save } from "lucide-react";

interface UserSolvedProblemsEditorProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserSolvedProblemsEditor({ userId, onSuccess, onCancel }: UserSolvedProblemsEditorProps) {
  const { createSolvedProblem, isCreating } = useUserSolvedProblemsAdmin(userId);

  const [formData, setFormData] = useState({
    problemId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problemId.trim()) return;

    try {
      const payload = {
        userId,
        problemId: formData.problemId,
      };

      await createSolvedProblem(payload);
      onSuccess();
    } catch (error) {
      // Error handled by hook toast
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex flex-col h-full min-h-0 space-y-6 p-2"
    >
      <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
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
              Add Solved Problem Record
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Record a solved problem for this user.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="submit"
            size="lg"
            disabled={isCreating || !formData.problemId.trim()}
            className="px-6 gap-2"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isCreating ? "Saving..." : "Add Record"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 rounded-md border bg-muted/20 p-6">
        <div className="grid gap-8">
          <div className="grid grid-cols-1 gap-6 max-w-md">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="problemId">Problem ID (Slug)</Label>
              <Input 
                id="problemId" 
                name="problemId" 
                type="text" 
                placeholder="e.g. two-sum"
                value={formData.problemId} 
                onChange={handleChange} 
                required 
              />
              <p className="text-xs text-muted-foreground">The exact slug of the problem.</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
