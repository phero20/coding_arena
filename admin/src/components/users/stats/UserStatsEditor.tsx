import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUserStatsAdmin } from "@/hooks/useUserAdmin";
import { Loader2, ChevronLeft, Save } from "lucide-react";

interface UserStatsEditorProps {
  id?: string;
  userId?: string; 
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserStatsEditor({ id, userId, onSuccess, onCancel }: UserStatsEditorProps) {
  const targetUserId = id || userId;
  const { stats, isLoading, updateStats, createStats, isUpdating, isCreating } = useUserStatsAdmin(targetUserId);

  const isSubmitting = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    totalPoints: 0,
    arenaPoints: 0,
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    arenaGames: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastSolveDate: "",
    languageCounts: "{}"
  });

  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (stats) {
      setFormData({
        totalPoints: Number(stats.totalPoints || 0),
        arenaPoints: Number(stats.arenaPoints || 0),
        totalSolved: Number(stats.totalSolved || 0),
        easySolved: Number(stats.easySolved || 0),
        mediumSolved: Number(stats.mediumSolved || 0),
        hardSolved: Number(stats.hardSolved || 0),
        arenaGames: Number(stats.arenaGames || 0),
        currentStreak: Number(stats.currentStreak || 0),
        bestStreak: Number(stats.bestStreak || 0),
        lastSolveDate: stats.lastSolveDate || "",
        languageCounts: JSON.stringify(stats.languageCounts || {}, null, 2),
      });
    }
  }, [stats]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) return;
    
    setJsonError(null);
    let parsedLanguageCounts = {};
    try {
      if (formData.languageCounts) {
        parsedLanguageCounts = JSON.parse(formData.languageCounts);
      }
    } catch (err: any) {
      setJsonError("Invalid JSON: " + err.message);
      return;
    }

    const payload = {
      ...formData,
      userId: targetUserId,
      languageCounts: parsedLanguageCounts,
    };

    if (id && stats) {
      await updateStats({ id: targetUserId, payload });
    } else {
      await createStats(payload);
    }
    onSuccess();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
              {id ? "Edit User Stats" : "Initialize User Stats"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {id ? "Update the statistics for this user." : "Initialize default stats for this user."}
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
            {isSubmitting ? "Saving..." : "Save Stats"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 rounded-md border bg-muted/20 p-6">
        <div className="grid gap-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="totalPoints">Total Points</Label>
              <Input id="totalPoints" name="totalPoints" type="number" value={formData.totalPoints} onChange={handleChange} required />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="arenaPoints">Arena Points</Label>
              <Input id="arenaPoints" name="arenaPoints" type="number" value={formData.arenaPoints} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="totalSolved">Total Solved</Label>
              <Input id="totalSolved" name="totalSolved" type="number" value={formData.totalSolved} onChange={handleChange} required />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="lastSolveDate">Last Solve Date (YYYY-MM-DD)</Label>
              <Input id="lastSolveDate" name="lastSolveDate" type="text" value={formData.lastSolveDate} onChange={handleChange} />
            </div>

            <div className="col-span-2 grid grid-cols-3 gap-6">
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="easySolved" className="text-muted-foreground">Easy</Label>
                <Input id="easySolved" name="easySolved" type="number" value={formData.easySolved} onChange={handleChange} required />
              </div>
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="mediumSolved" className="text-muted-foreground">Medium</Label>
                <Input id="mediumSolved" name="mediumSolved" type="number" value={formData.mediumSolved} onChange={handleChange} required />
              </div>
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="hardSolved" className="text-muted-foreground">Hard</Label>
                <Input id="hardSolved" name="hardSolved" type="number" value={formData.hardSolved} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="arenaGames">Arena Games</Label>
              <Input id="arenaGames" name="arenaGames" type="number" value={formData.arenaGames} onChange={handleChange} required />
            </div>
            <div className="hidden md:block space-y-2" />
            
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="currentStreak">Current Streak</Label>
              <Input id="currentStreak" name="currentStreak" type="number" value={formData.currentStreak} onChange={handleChange} required />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="bestStreak">Best Streak</Label>
              <Input id="bestStreak" name="bestStreak" type="number" value={formData.bestStreak} onChange={handleChange} required />
            </div>
            
            <div className="col-span-2 space-y-2 flex flex-col">
              <Label htmlFor="languageCounts">Language Counts (JSON)</Label>
              <Textarea 
                id="languageCounts" 
                name="languageCounts" 
                value={formData.languageCounts} 
                onChange={handleChange} 
                className="font-mono h-32 bg-background" 
                required 
              />
              {jsonError && <p className="text-sm font-medium text-destructive">{jsonError}</p>}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
