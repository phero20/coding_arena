"use client";

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SolutionCodeBlockProps {
  language: string;
  code: string;
}

export const SolutionCodeBlock: React.FC<SolutionCodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="relative group/code overflow-hidden">
      <div className="bg-muted px-4 py-1 border-b border-border/40 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
          {language}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={handleCopy}
        >
          {copied ? <Check className="size-3 text-difficulty-easy" /> : <Copy className="size-3" />}
        </Button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.8rem",
          lineHeight: "1.6",
          background: "transparent",
          width: "100%",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          overflowX: "hidden",
        }}
        codeTagProps={{
          style: {
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            display: "block",
            maxWidth: "100%",
          },
        }}
      >
        {code.replace(/\n$/, "")}
      </SyntaxHighlighter>
    </Card>
  );
};
