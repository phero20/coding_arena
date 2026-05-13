"use client";

import React, { useState } from "react";
import { DynamicEditor as Editor, LanguageSelector } from "@/components/workspace-shared";
import { useMonacoConfig } from "@/hooks/workspace/use-monaco-config";
import { useTheme } from "next-themes";
import { useEditorStore } from "@/store/use-editor-store";
import { WrapText, Code2, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLangConfig } from "@/constants/compiler-languages";
import type { LanguageOption } from "@/types/component.types";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

interface Props {
  code: string;
  onChange: (value: string) => void;
  language: string;
  languages: LanguageOption[];
  onLanguageChange: (value: string) => void;
  onReset: () => void;
}

const TAB_CLS =
  "h-10 rounded-none px-3 text-[11px] font-black uppercase tracking-wide " +
  "border-b-2 border-primary text-primary flex items-center gap-1.5 bg-transparent shrink-0";

export const CompilerEditor: React.FC<Props> = ({
  code, onChange, language, languages, onLanguageChange, onReset,
}) => {
  const { theme } = useTheme();
  const { preferences } = useEditorStore();
  const [wordWrap, setWordWrap] = useState(true);
  const monacoOptions = useMonacoConfig({ ...preferences, wordWrap });
  const monacoLanguage = getLangConfig(language).monacoLang;

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="h-14 px-3 flex items-center gap-2 border-b border-border/40 bg-card/10 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSelector
            value={language}
            onChange={onLanguageChange}
            languages={languages}
          />

          <Button
            variant="ghost"
            size="icon"
            title="Toggle Word Wrap"
            className={cn(
              "size-7 shrink-0 transition-colors",
              wordWrap
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-primary",
            )}
            onClick={() => setWordWrap((w) => !w)}
          >
            <WrapText className="size-3.5" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-muted-foreground hover:text-primary transition-colors"
              >
                <RefreshCw className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/40">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-sm font-bold">
                  Reset Code?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground">
                  Restores the default boilerplate for the selected language.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="h-8 text-xs font-bold border-border/40">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onReset}
                  className="h-8 text-xs font-bold bg-primary text-primary-foreground hover:opacity-90"
                >
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Link href="/settings?tab=editor">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-primary transition-colors shrink-0"
              title="Editor Settings"
            >
              <Settings className="size-3.5" />
            </Button>
          </Link>
        </div>

        <div className="ml-auto flex items-center h-full">
          <div className={TAB_CLS}>
            <Code2 className="size-3 shrink-0" />
            <span>Code</span>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={monacoLanguage}
          theme="vs-dark"
          value={code}
          onChange={(val) => onChange(val ?? "")}
          options={monacoOptions}
        />
      </div>
    </div>
  );
};
