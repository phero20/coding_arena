"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import KaTeX CSS for math rendering
import "katex/dist/katex.min.css";

interface SolutionViewerProps {
  content?: string;
}
// Assuming DescriptionPanelProps and problem type are defined elsewhere or will be added.
// For now, let's define a placeholder for DescriptionPanelProps to make the code syntactically valid.
interface DescriptionPanelProps {
  problem: any; // Replace 'any' with the actual type of 'problem'
}

export const DescriptionPanel: React.FC<DescriptionPanelProps> = ({
  problem,
}) => {
  // This is a placeholder for the DescriptionPanel content.
  // The instruction provided a snippet that seems to be misplaced.
  // I'm placing a minimal valid structure here based on the instruction's intent
  // to introduce a DescriptionPanel with Tabs.
  return (
    <div className="flex flex-col bg-card/10 w-full max-w-full md:h-full md:overflow-hidden min-w-0">
      <Tabs
        defaultValue="description"
        className="flex-1 flex flex-col md:h-full md:overflow-hidden max-w-full min-w-0"
      >
        {/* TabsList and TabsContent would go here */}
        {/* The instruction snippet for "Official solutions will be available soon."
            seems to be from SolutionViewer and is syntactically incorrect here.
            I'm omitting it from DescriptionPanel for now to maintain valid syntax. */}
      </Tabs>
    </div>
  );
};

export const SolutionViewer: React.FC<SolutionViewerProps> = ({ content }) => {
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-50">
        <CheckCircle2 className="size-12 text-muted-foreground" />
        <p className="text-sm font-medium">
          Official solutions will be available soon.
        </p>
      </div>
    );
  }

  // PRE-PROCESSING: Clean up LeetCode-specific weirdness and identifiers
  const processedContent = content
    .replace(/\[TOC\]/g, "") // Remove TOC marker
    .replace(/---## Solution/g, "## Solution") // Fix double headers
    .replace(/!\?\!.*?\?\!/g, "") // Remove LeetCode slide identifiers (!?!...!?!)
    .replace(/\{:.*?\}/g, "") // Remove Jekyll-style attributes ({: ...})
    .replace(/([^\n])(#{1,6}\s)/g, "$1\n$2") // Fix mashed headers
    .trim();

  // SPLITTING INTO APPROACHES
  const sections = processedContent.split(
    /^\s*#{1,4}\s*(?:\*\*)?Approach\s*(?:\*\*)?\s+/im,
  );
  const overview = sections[0].trim();
  const approaches = sections.slice(1).map((section, index) => {
    const firstLineEnd = section.indexOf("\n");
    const header =
      firstLineEnd === -1 ? section : section.substring(0, firstLineEnd);
    const body =
      firstLineEnd === -1 ? "" : section.substring(firstLineEnd).trim();

    // Extract ID (number) and Title
    const match = header.match(/^(\d+)[\.\s:]*\s*(.*)/i);
    const id = match && match[1] ? match[1] : (index + 1).toString();
    const title =
      match && match[2]
        ? match[2].replace(/\*\*|:/g, "").trim()
        : header.trim();

    return {
      id: id || `${index + 1}`,
      title: title || `Approach ${id || index + 1}`,
      content: body,
    };
  });

  const renderMarkdown = (md: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={{
        img: () => null,
        h1: ({ node, ...props }) => {
          const text = props.children?.toString() || "";
          if (
            text.toLowerCase().includes("solution") ||
            text.toLowerCase().includes("video") ||
            text.toLowerCase().includes("approach")
          )
            return null;
          return (
            <h1
              className="text-xl md:text-2xl font-bold mb-4 text-foreground/90 whitespace-normal"
              {...props}
            />
          );
        },
        h2: ({ node, ...props }) => {
          const text = props.children?.toString() || "";
          const lowerText = text.toLowerCase();
          if (
            lowerText.includes("solution") ||
            lowerText.includes("video") ||
            lowerText.includes("approach")
          )
            return null;
          return (
            <div className="mt-8 mb-4 group not-prose w-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-2 rounded-full bg-primary shrink-0" />
                <h2
                  className="text-base md:text-lg font-bold tracking-tight text-foreground/90 wrap-break-word"
                  {...props}
                />
              </div>
              <Separator className="bg-primary/20 h-[2px] w-full" />
            </div>
          );
        },
        h3: ({ node, ...props }) => {
          const text = props.children?.toString() || "";
          if (
            text.toLowerCase().includes("solution") ||
            text.toLowerCase().includes("video") ||
            text.toLowerCase().includes("approach")
          )
            return null;
          return (
            <h3
              className="text-sm md:text-md font-bold text-primary mt-6 mb-3 border-l-4 border-primary pl-4 not-prose wrap-break-word"
              {...props}
            />
          );
        },
        h4: ({ node, ...props }) => {
          const text = props.children?.toString() || "";
          if (text.toLowerCase().includes("approach")) return null;
          const isComplexity = text.toLowerCase().includes("complexity");
          return (
            <h4
              className={cn(
                "text-xs md:text-sm font-bold mt-4 mb-2 not-prose wrap-break-word",
                isComplexity
                  ? "text-amber-400 flex items-center gap-2"
                  : "text-foreground/80",
              )}
              {...props}
            >
              {isComplexity && <Info className="size-4 shrink-0" />}
              {text}
            </h4>
          );
        },
        p: ({ node, ...props }) => (
          <p
            className="text-[13px] md:text-sm leading-relaxed text-foreground/70 mb-3 wrap-break-word"
            {...props}
          />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside space-y-2 mb-6" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li
            className="text-[13px] md:text-sm text-foreground/70 wrap-break-word "
            {...props}
          />
        ),
        code: ({ node, inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <Card className="overflow-hidden border-border/40 my-6  not-prose w-full min-w-0">
              <div className="bg-muted/40 px-4 py-2 border-b border-border/40 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {match[1]}
                </span>
              </div>
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                // 1. This handles the outer container
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  fontSize: "0.75rem",
                  lineHeight: "1.8",
                  background: "transparent",
                  overflowX: "hidden", // Hide horizontal scroll
                  whiteSpace: "pre-wrap", // Force wrapping
                  wordBreak: "break-all", // Break long strings
                }}
                // 2. This handles the actual <code> tag inside the <pre>
                codeTagProps={{
                  style: {
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    display: "block", // Ensures it takes up the full width
                    maxWidth: "100%",
                  },
                }}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </Card>
          ) : (
            <code
              className="px-1.5 py-0.5 rounded-md  bg-muted text-primary text-[12px] md:text-[13px] border border-border/40 break-all"
              {...props}
            >
              {children}
            </code>
          );
        },
        hr: () => <Separator className="my-6 bg-border/20 not-prose" />,
      }}
    >
      {md}
    </ReactMarkdown>
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden min-w-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12 prose prose-invert">
      <h1 className="flex items-center gap-3 text-xl md:text-2xl font-bold mb-4 text-foreground/90 whitespace-normal">
        <CheckCircle2 className="size-5 md:size-6 shrink-0 text-primary" />
        Solutions
      </h1>
      {overview && <div>{renderMarkdown(overview)}</div>}

      {approaches.length > 0 && (
        <Tabs
          defaultValue={approaches[0].id}
          className="w-full max-w-full not-prose mt-8 flex flex-col min-w-0"
        >
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <div className="h-5 md:h-6 w-1 bg-primary rounded-full transition-all duration-500" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/80">
              Available Approaches
            </span>
          </div>

          <div className="w-full mb-4">
            <TabsList className="bg-muted/60 p-2 flex-wrap justify-start  h-auto gap-2 border border-border">
              {approaches.map((app) => (
                <TabsTrigger
                  key={app.id}
                  value={app.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] sm:text-xs font-bold px-2 md:px-4 py-2 md:py-2.5  transition-all border border-transparent hover:border-primary/20 shrink-0 uppercase tracking-tight shadow-none bg-primary/10"
                >
                  {app.id}. {app.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {approaches.map((app) => (
            <TabsContent
              key={app.id}
              value={app.id}
              className="mt-0 focus-visible:outline-none animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 flex-1 min-w-0"
            >
              <div className="prose prose-invert max-w-none prose-p:max-w-none prose-li:max-w-none overflow-x-hidden w-full min-w-0">
                {renderMarkdown(app.content)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};
