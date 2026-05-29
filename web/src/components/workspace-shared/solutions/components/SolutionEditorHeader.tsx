import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Type, Send, Edit } from "lucide-react";

interface SolutionEditorHeaderProps {
  title: string;
  setTitle: (title: string) => void;
  isEditMode: boolean;
  isPending: boolean;
  onPublish: () => void;
}

export const SolutionEditorHeader: React.FC<SolutionEditorHeaderProps> = ({
  title,
  setTitle,
  isEditMode,
  isPending,
  onPublish,
}) => {
  return (
    <div className="space-y-4 mb-4 ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Edit className="size-5 text-primary" />
          <h2 className="text-lg font-bold tracking-tight">
            {isEditMode ? "Edit Solution" : "New Solution"}
          </h2>
        </div>

        <Button
          onClick={onPublish}
          disabled={isPending}
          size="sm"
          className="transition-all"
        >
          <Send className="size-4" />
          {isPending ? (isEditMode ? "Saving..." : "Publishing...") : (isEditMode ? "Save Changes" : "Publish")}
        </Button>
      </div>

      <div className="relative group">
        <Type className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Give your solution a title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="pl-10 h-12"
        />
      </div>
    </div>
  );
};
