"use client";

import { useState } from "react";
import { FilePlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDiagram } from "@/hooks/mutations/use-workspace.mutations";

interface CreateDiagramDialogProps {
  workspaceId: string;
}

export function CreateDiagramDialog({ workspaceId }: CreateDiagramDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  
  const createDiagramMutation = useCreateDiagram(workspaceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createDiagramMutation.mutateAsync({ title: title.trim() });
      setTitle("");
      setIsOpen(false);
    } catch (err) {
      // Error handled by custom mutation toast
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="font-medium inline-flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all">
          <Plus className="h-4 w-4" />
          New Diagram
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FilePlus className="h-5 w-5 text-primary" />
              Create Diagram
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="diagram-title" className="text-sm font-medium">
                Diagram Title
              </Label>
              <Input
                id="diagram-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. System Architecture, Sequence Diagram"
                autoComplete="off"
                maxLength={100}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || createDiagramMutation.isPending}
            >
              {createDiagramMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
