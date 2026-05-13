import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { SolutionCodeBlock } from "./SolutionCodeBlock";

interface OfficialSolutionProps {
  officialSolution: string | null | undefined;
}

export const OfficialSolution: React.FC<OfficialSolutionProps> = ({
  officialSolution,
}) => {
  // PRE-PROCESSING: Clean up LeetCode-specific weirdness and identifiers
  const processedContent = React.useMemo(() => {
    if (!officialSolution) return "";
    return officialSolution
      .replace(/\[TOC\]/g, "") // Remove TOC marker
      .replace(/---## Solution/g, "## Solution") // Fix double headers
      .replace(/!\?\!.*?\?\!/g, "") // Remove LeetCode slide identifiers (!?!...!?!)
      .replace(/\{:.*?\}/g, "") // Remove Jekyll-style attributes ({: ...})
      .replace(/([^\n])(#{1,6}\s)/g, "$1\n$2") // Fix mashed headers
      .trim();
  }, [officialSolution]);

  // SPLITTING INTO APPROACHES
  const { overview, approaches } = React.useMemo(() => {
    if (!processedContent) return { overview: "", approaches: [] };

    const sections = processedContent.split(
      /^\s*#{1,4}\s*(?:\*\*)?Approach\s*(?:\*\*)?\s+/im,
    );
    const overviewText = sections[0].trim();
    const approachList = sections.slice(1).map((section, index) => {
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

    return { overview: overviewText, approaches: approachList };
  }, [processedContent]);

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
              className="text-xl md:text-2xl font-bold mb-4 text-foreground/90 whitespace-normal uppercase tracking-tight"
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
                  className="text-base md:text-lg font-bold tracking-tight text-foreground/90 wrap-break-word uppercase"
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
              className="text-sm md:text-md font-bold text-primary mt-6 mb-3 border-l-4 border-primary pl-4 not-prose wrap-break-word uppercase"
              {...props}
            />
          );
        },
        p: ({ node, ...props }) => (
          <p
            className="text-[13px] md:text-sm leading-relaxed text-foreground/70 mb-3 wrap-break-word"
            {...props}
          />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside space-y-2 mb-6 ml-2" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li
            className="text-[13px] md:text-sm text-foreground/70 wrap-break-word"
            {...props}
          />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-muted bg-muted/30 p-4 my-6 rounded-r-lg italic text-foreground/70 text-sm"
            {...props}
          />
        ),
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <div className="my-6">
              <SolutionCodeBlock 
                language={match[1]} 
                code={String(children).replace(/\n$/, "")} 
              />
            </div>
          ) : (
            <code
              className="px-1.5 py-0.5 rounded-md bg-muted text-primary text-[12px] md:text-[13px] border border-border/40 break-all font-mono"
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
    <QueryGuard
      loading={false}
      error={null}
      data={officialSolution}
      emptyTitle="No Official Solutions"
      emptyMessage="Official solutions are not available for this problem yet."
    >
      {() => (
        <div className="space-y-2 prose prose-invert max-w-none">
          <h1 className="flex items-center gap-1   text-xl font-bold text-foreground/90 whitespace-normal uppercase tracking-tight">
            <CheckCircle2 className="size-5 md:size-6 shrink-0 text-primary" />
            Official Solutions
          </h1>

          {overview && <div>{renderMarkdown(overview)}</div>}

          {approaches.length > 0 && (
            <Tabs
              defaultValue={approaches[0].id}
              className="w-full max-w-full not-prose mt-2 flex flex-col min-w-0"
            >
              <div className="flex items-center gap-3 mb-6 shrink-0">
                <div className="h-5 md:h-6 w-1 bg-primary rounded-full transition-all duration-500" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/80">
                  Available Approaches
                </span>
              </div>

              <div className="w-full mb-4">
                <TabsList className="bg-muted/60 p-2 flex-wrap justify-start h-auto gap-2 border border-border">
                  {approaches.map((app) => (
                    <TabsTrigger
                      key={app.id}
                      value={app.id}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] sm:text-xs font-bold px-2 md:px-4 py-2 md:py-2.5 transition-all border border-transparent hover:border-primary/20 shrink-0 uppercase tracking-tight shadow-none bg-primary/10"
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
      )}
    </QueryGuard>
  );
};
