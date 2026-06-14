import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, MemoryStick } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { SolutionCodeBlock } from "./SolutionCodeBlock";

// ---------------------------------------------------------
// Types matching the AI-generated solution JSON schema
// ---------------------------------------------------------
interface AiImplementation {
  language: string;
  code: string;
}

interface AiSolution {
  approach_name: string;
  time_complexity: string;
  space_complexity: string;
  editorial_explanation: string;
  implementations?: AiImplementation[];
  language?: string;
  code?: string;
}

interface OfficialSolutionProps {
  /** Raw DB string — either a JSON array of AiSolution objects or a legacy markdown string */
  officialSolution: string | null | undefined;
}

// ---------------------------------------------------------
// Markdown renderer (shared across all approach tabs)
// ---------------------------------------------------------
const renderMarkdown = (md: string) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, remarkMath]}
    rehypePlugins={[rehypeRaw, rehypeKatex]}
    components={{
      img: () => null,
      h1: ({ node, ...props }) => (
        <h1
          className="text-xl md:text-2xl font-bold mb-4 text-foreground/90 whitespace-normal uppercase tracking-tight"
          {...props}
        />
      ),
      h2: ({ node, ...props }) => (
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
      ),
      h3: ({ node, ...props }) => (
        <h3
          className="text-sm md:text-md font-bold text-primary mt-6 mb-3 border-l-4 border-primary pl-4 not-prose wrap-break-word uppercase"
          {...props}
        />
      ),
      p: ({ node, ...props }) => (
        <p
          className="text-[13px] md:text-sm leading-relaxed text-foreground/70 mb-3 wrap-break-word"
          {...props}
        />
      ),
      ul: ({ node, ...props }) => (
        <ul className="list-disc list-inside space-y-2 mb-6 ml-2" {...props} />
      ),
      ol: ({ node, ...props }) => (
        <ol className="list-decimal list-inside space-y-2 mb-6 ml-2" {...props} />
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

// ---------------------------------------------------------
// Main Component
// ---------------------------------------------------------
export const OfficialSolution: React.FC<OfficialSolutionProps> = ({
  officialSolution,
}) => {
  // Parse the solutions JSON array produced by AiAddSolveService
  const approaches = React.useMemo<AiSolution[]>(() => {
    if (!officialSolution) return [];
    try {
      const parsed = JSON.parse(officialSolution);
      if (Array.isArray(parsed)) {
        return parsed.map((app: AiSolution) => {
          // Normalize flat structure to implementations array
          if (app.language && app.code && !app.implementations) {
            return {
              ...app,
              implementations: [{ language: app.language, code: app.code }],
            };
          }
          return app;
        });
      }
    } catch {
      // Not JSON — not supported in this component
    }
    return [];
  }, [officialSolution]);

  return (
    <QueryGuard
      loading={false}
      error={null}
      data={approaches.length > 0 ? approaches : null}
      emptyTitle="No Official Solutions"
      emptyMessage="Official solutions are not available for this problem yet."
    >
      {() => (
        <div className="space-y-2 prose prose-invert max-w-none">
          <h1 className="flex items-center gap-1 text-xl font-bold text-foreground/90 whitespace-normal uppercase tracking-tight">
            <CheckCircle2 className="size-5 md:size-6 shrink-0 text-primary" />
            Official Solutions
          </h1>

          <Tabs
            defaultValue="0"
            className="w-full max-w-full not-prose mt-2 flex flex-col min-w-0"
          >
            {/* Tab list header */}
            <div className="flex items-center gap-3 mb-6 shrink-0">
              <div className="h-5 md:h-6 w-1 bg-primary rounded-full transition-all duration-500" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/80">
                Available Approaches
              </span>
            </div>

            <div className="w-full mb-4">
              <TabsList className="bg-muted/60 p-2 flex-wrap justify-start h-auto gap-2 border border-border">
                {approaches.map((app, index) => (
                  <TabsTrigger
                    key={index}
                    value={String(index)}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] sm:text-xs font-bold px-2 md:px-4 py-2 md:py-2.5 transition-all border border-transparent hover:border-primary/20 shrink-0 uppercase tracking-tight shadow-none bg-primary/10"
                  >
                    {index + 1}. {app.approach_name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {approaches.map((app, index) => (
              <TabsContent
                key={index}
                value={String(index)}
                className="mt-0 focus-visible:outline-none animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 flex-1 min-w-0"
              >
                {/* Complexity badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6 not-prose">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold bg-muted/60 border border-border px-3 py-1.5 rounded-full">
                    <Clock className="size-3 text-primary shrink-0" />
                    <span className="text-foreground/70">Time:</span>
                    <span className="text-primary">{app.time_complexity}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold bg-muted/60 border border-border px-3 py-1.5 rounded-full">
                    <MemoryStick className="size-3 text-primary shrink-0" />
                    <span className="text-foreground/70">Space:</span>
                    <span className="text-primary">{app.space_complexity}</span>
                  </div>
                  {app.implementations?.map((impl) => (
                    <div key={impl.language} className="flex items-center gap-1.5 text-[11px] font-mono font-semibold bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                      <span className="text-primary uppercase">{impl.language}</span>
                    </div>
                  ))}
                </div>

                {/* Editorial explanation (markdown) */}
                <div className="prose prose-invert max-w-none prose-p:max-w-none prose-li:max-w-none overflow-x-hidden w-full min-w-0 mb-6">
                  {renderMarkdown(app.editorial_explanation)}
                </div>

                {/* Code blocks — one per language implementation */}
                <div className="not-prose space-y-4">
                  {app.implementations?.map((impl) => (
                    <SolutionCodeBlock key={impl.language} language={impl.language} code={impl.code} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </QueryGuard>
  );
};
