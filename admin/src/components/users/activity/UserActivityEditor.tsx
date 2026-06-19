import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserActivityAdmin } from "@/hooks/useUserAdmin";
import { ChevronLeft, Loader2, Save } from "lucide-react";

interface UserActivityEditorProps {
  userId: string;
  date?: string; 
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserActivityEditor({ userId, date, onSuccess, onCancel }: UserActivityEditorProps) {
  const { activity, isLoading, updateActivity, createActivity, isUpdating, isCreating } = useUserActivityAdmin(userId);

  const isSubmitting = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Default to today
    pointsEarned: 0,
    arenaPointsEarned: 0,
    submissions: 0,
    matches: 0,
  });

  useEffect(() => {
    if (activity && date) {
      const existingActivity = activity.find(a => a.date === date);
      if (existingActivity) {
        setFormData({
          date: existingActivity.date,
          pointsEarned: Number(existingActivity.pointsEarned || 0),
          arenaPointsEarned: Number(existingActivity.arenaPointsEarned || 0),
          submissions: Number(existingActivity.submissions || 0),
          matches: Number(existingActivity.matches || 0),
        });
      }
    }
  }, [activity, date]);

  if (isLoading && date) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const payload = {
      ...formData,
      userId,
    };

    if (date) {
      // update
      await updateActivity({ id: userId, date: date, payload });
    } else {
      // create
      await createActivity(payload);
    }
    onSuccess();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
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
              {date ? "Edit Activity Record" : "Add Activity Record"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {date ? `Editing activity for ${date}` : "Record daily points, submissions, and matches."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="px-6 gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? "Saving..." : "Save Activity"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 rounded-md border bg-muted/20 p-6">
        <div className="grid gap-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 space-y-2 flex flex-col">
              <Label htmlFor="date">Date (YYYY-MM-DD)</Label>
              <Input 
                id="date" 
                name="date" 
                type="text" 
                value={formData.date} 
                onChange={handleChange} 
                required 
                disabled={!!date} // Cannot change date when editing
                pattern="\d{4}-\d{2}-\d{2}"
                placeholder="2024-01-01"
              />
            </div>

            <div className="space-y-2 flex flex-col">
              <Label htmlFor="pointsEarned">Points Earned</Label>
              <Input id="pointsEarned" name="pointsEarned" type="number" value={formData.pointsEarned} onChange={handleChange} required />
            </div>

            <div className="space-y-2 flex flex-col">
              <Label htmlFor="arenaPointsEarned">Arena Points Earned</Label>
              <Input id="arenaPointsEarned" name="arenaPointsEarned" type="number" value={formData.arenaPointsEarned} onChange={handleChange} required />
            </div>

            <div className="space-y-2 flex flex-col">
              <Label htmlFor="submissions">Submissions</Label>
              <Input id="submissions" name="submissions" type="number" value={formData.submissions} onChange={handleChange} required />
            </div>

            <div className="space-y-2 flex flex-col">
              <Label htmlFor="matches">Matches</Label>
              <Input id="matches" name="matches" type="number" value={formData.matches} onChange={handleChange} required />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
