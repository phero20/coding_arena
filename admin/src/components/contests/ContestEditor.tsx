import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type Contest } from "@/services/contest.service";
import { useContestAdmin } from "@/hooks/useContest";
import { Loader2, ChevronLeft, Save } from "lucide-react";

interface ContestEditorProps {
  id?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ContestEditor({ id, onSuccess, onCancel }: ContestEditorProps) {
  const { contests, createContest, updateContest, isCreating, isUpdating, isLoading } = useContestAdmin();
  
  const initialData = id ? contests.find(c => c.id === id) : null;
  const isSubmitting = isCreating || isUpdating;

  const [formData, setFormData] = useState<Partial<Contest>>({
    clistId: 0,
    title: "",
    description: "",
    platform: "",
    startTime: "",
    endTime: "",
    duration: 0,
    href: "",
    resourceId: 0,
    icon: "",
    status: "upcoming",
  });

  const toLocalISOString = (dateObj: Date | string) => {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        startTime: toLocalISOString(initialData.startTime),
        endTime: toLocalISOString(initialData.endTime),
      });
    } else {
      setFormData({
        clistId: 0,
        title: "",
        description: "",
        platform: "",
        startTime: toLocalISOString(new Date()),
        endTime: toLocalISOString(new Date(Date.now() + 3600000)), // +1 hour
        duration: 3600,
        href: "",
        resourceId: 0,
        icon: "",
        status: "upcoming",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Contest> = {
        ...formData,
        clistId: Number(formData.clistId),
        duration: Number(formData.duration),
        resourceId: formData.resourceId ? Number(formData.resourceId) : null,
        startTime: new Date(formData.startTime!).toISOString(),
        endTime: new Date(formData.endTime!).toISOString(),
      };

      if (initialData) {
        await updateContest({ id: initialData.id, payload });
      } else {
        await createContest(payload);
      }
      onSuccess();
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading && id && !initialData) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (id && !initialData && !isLoading) {
    return (
      <div className="space-y-4">
        <p className="text-destructive font-medium">Contest not found.</p>
        <Button onClick={onCancel}>Go Back</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 space-y-6 p-1">
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
              {initialData ? `Edit Contest: ${initialData.title}` : `Create New Contest`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {initialData
                ? "Update the details of the contest."
                : "Add a new contest to the system."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button type="submit" disabled={isSubmitting} size="lg" className="px-6 gap-2">
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Save Contest"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 rounded-md border bg-muted/20 p-6">
        <div className="grid gap-8">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Weekly Contest 123"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
             <div className="space-y-2 flex flex-col">
              <Label htmlFor="platform">Platform</Label>
              <Input
                id="platform"
                placeholder="e.g. leetcode"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2 flex flex-col">
              <Label htmlFor="clistId">CLIST ID</Label>
              <Input
                id="clistId"
                type="number"
                placeholder="e.g. 52431"
                value={formData.clistId}
                onChange={(e) => setFormData({ ...formData, clistId: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="resourceId">Resource ID (Optional)</Label>
              <Input
                id="resourceId"
                type="number"
                placeholder="e.g. 1"
                value={formData.resourceId || ""}
                onChange={(e) => setFormData({ ...formData, resourceId: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2 flex flex-col">
              <Label htmlFor="duration">Duration (Seconds)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g. 3600"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                required
              />
            </div>
             <div className="space-y-2 flex flex-col">
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                placeholder="e.g. upcoming"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="href">URL (href)</Label>
            <Input
              id="href"
              type="url"
              placeholder="https://..."
              value={formData.href}
              onChange={(e) => setFormData({ ...formData, href: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2 flex flex-col">
            <Label htmlFor="icon">Icon URL (Optional)</Label>
            <Input
              id="icon"
              type="text"
              placeholder="https://..."
              value={formData.icon || ""}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            />
          </div>

          <div className="space-y-2 flex flex-col min-h-[150px]">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Contest description..."
              className="flex-1 resize-y min-h-[100px]"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
      </div>
    </form>
  );
}