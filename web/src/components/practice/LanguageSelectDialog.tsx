"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LanguageSelector } from "@/components/workspace-shared/LanguageSelector";
import type { Problem } from "@/types/api";

interface LanguageSelectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  problem: Problem | null;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  onConfirm: () => void;
  isActionLoading: boolean;
}

export const LanguageSelectDialog: React.FC<LanguageSelectDialogProps> = ({
  isOpen,
  onOpenChange,
  problem,
  selectedLanguage,
  setSelectedLanguage,
  onConfirm,
  isActionLoading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Select Battle Language
          </DialogTitle>
          <DialogDescription className="text-sm">
            All participants will compete using this selection to ensure a level
            playing field.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border border-border/40 rounded p-3 bg-muted/20">
            <span className="text-sm font-bold text-foreground">Language</span>
            {problem && (
              <LanguageSelector
                value={selectedLanguage}
                onChange={setSelectedLanguage}
                languages={Object.keys(problem.code_snippets || {}).map(
                  (lang) => ({
                    id: lang,
                    label: lang.toUpperCase(),
                  }),
                )}
              />
            )}
          </div>
          {(!problem?.code_snippets ||
            Object.keys(problem.code_snippets).length === 0) && (
            <p className="text-xs text-destructive text-center font-medium">
              Warning: No code snippets found for this problem. Defaulting to
              JavaScript.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs font-bold uppercase"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isActionLoading}
            className="text-xs font-bold uppercase px-8"
          >
            {isActionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Confirm & Host
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
