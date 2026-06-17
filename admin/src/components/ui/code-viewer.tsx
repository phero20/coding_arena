"use client";

import React, { useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DynamicHighlighter as SyntaxHighlighter } from "../workspace-shared/editor/DynamicHighlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeViewerProps {
  code: string;
  language?: string;
  label?: string;
  className?: string;
  showHeader?: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = "javascript",
  label = "Source",
  className,
  showHeader = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className={cn("relative flex flex-col overflow-hidden", className)}>
      {showHeader && (
        <div className="flex items-center justify-between px-6 py-2 border-y border-border/10 bg-muted/30">
            
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {label}
            </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className={cn(
              "h-7 px-2 text-[10px] font-bold uppercase tracking-tight gap-1.5 hover:bg-primary/10 transition-all",
              copied && "text-primary"
            )}
          >
            {copied ? (
              <>
                <Check className="size-3 stroke-3" />
              </>
            ) : (
              <>
                <Copy className="size-3" />
              </>
            )}
          </Button>
        </div>
      )}

      <div className="relative">
        <SyntaxHighlighter
          language={language.toLowerCase()}
          style={vscDarkPlus}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: "1.5rem 1.5rem 2rem 1.5rem",
            fontSize: "0.75rem",
            lineHeight: "1.8",
            background: "transparent",
            overflowX: "auto",
            whiteSpace: "pre",
            wordBreak: "normal",
          }}
          codeTagProps={{
            style: {
              fontFamily: "var(--font-mono)",
              display: "block",
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
