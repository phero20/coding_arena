"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { SolutionCodeBlock } from "./SolutionCodeBlock";

// Import KaTeX CSS for math rendering
import "katex/dist/katex.min.css";

interface SolutionMarkdownProps {
  content: string;
  isOfficial?: boolean;
}

export const SolutionMarkdown: React.FC<SolutionMarkdownProps> = ({ 
  content, 
  isOfficial = false 
}) => {
  const processContent = (text: string) => {
    if (!isOfficial) return text;
    
    // Legacy official solution processing
    return text
      .replace(/\[TOC\]/g, "")
      .replace(/---## Solution/g, "## Solution")
      .replace(/!\?\!.*?\?\!/g, "")
      .replace(/\{:.*?\}/g, "")
      .replace(/([^\n])(#{1,6}\s)/g, "$1\n$2")
      .trim();
  };

  const processedContent = React.useMemo(() => processContent(content), [content, isOfficial]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-xl font-bold mb-4 text-primary" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <div className="mt-8 mb-4 group not-prose w-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-2 rounded-full bg-primary shrink-0" />
              <h2
                className="text-base font-bold tracking-tight text-primary uppercase"
                {...props}
              />
            </div>
            <Separator className="bg-primary/20 h-[1px] w-full" />
          </div>
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="text-sm font-bold text-primary mt-6 mb-3 border-l-4 border-primary pl-4 uppercase"
            {...props}
          />
        ),
        p: ({ node, ...props }) => (
          <p
            className="text-sm leading-relaxed text-foreground/70 mb-4"
            {...props}
          />
        ),
        ul: ({ node, ...props }) => (
          <ul
            className="list-disc list-inside space-y-2 mb-6 ml-4 text-sm text-foreground/70"
            {...props}
          />
        ),
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        code: ({ node, inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <Card className="overflow-hidden border-border/40 my-6 not-prose bg-muted/30 shadow-none">
              <SolutionCodeBlock language={match[1]} code={String(children)} />
            </Card>
          ) : (
            <code
              className="px-1.5 py-0.5 rounded-md bg-muted text-primary text-[12px] border border-border/40 shadow-none"
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};
