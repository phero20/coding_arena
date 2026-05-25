import React, { useEffect, useMemo } from "react";
import { useTrackConceptQuery } from "@/hooks/queries/use-academy.queries";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { ConceptViewSkeleton } from "@/components/skeletons/AcademySkeletons";
import {
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Info,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ConceptViewProps {
  trackSlug: string;
  conceptSlug: string;
}

type ReferenceLink = {
  label: string;
  href: string;
};

const referenceLinkPattern = /^\[([^\]]+)\]:\s+(\S+)\s*$/gm;

function extractReferenceLinks(markdown: string) {
  const links = new Map<string, ReferenceLink>();

  for (const match of markdown.matchAll(referenceLinkPattern)) {
    const label = match[1].trim();
    const href = match[2].trim();

    if (!links.has(label)) {
      links.set(label, { label, href });
    }
  }

  return Array.from(links.values());
}

const markdownComponents: any = {
  code({ node, inline, className, children, ...props }: any) {
    const fullMatch = /language-(.+)/.exec(className || "");
    const isExercism =
      !inline && fullMatch && fullMatch[1].startsWith("exercism/");

    if (isExercism) {
      const type = fullMatch![1].split("/")[1]; // "advanced", "note", "caution"
      const isAdvanced = type === "advanced";
      const isCaution = type === "caution";
      const isNote = type === "note" || (!isAdvanced && !isCaution);

      const borderColor = isAdvanced
        ? "border-primary"
        : isCaution
          ? "border-destructive"
          : "border-secondary-foreground";
      const bgColor = isAdvanced
        ? "bg-card/60"
        : isCaution
          ? "bg-destructive/5"
          : "bg-card/60";
      const textColor = isAdvanced
        ? "text-primary"
        : isCaution
          ? "text-destructive"
          : "text-secondary-foreground";

      const Icon = isAdvanced ? Lightbulb : isCaution ? AlertTriangle : Info;
      const title = isAdvanced
        ? "Advanced Concept"
        : isCaution
          ? "Caution"
          : "Note";

      return (
        <Card className={`my-8  p-6 shadow-none ${bgColor}`}>
          <div
            className={`flex items-center gap-2 mb-4 font-bold text-lg ${textColor}`}
          >
            <Icon className="w-5 h-5" />
            <span>{title}</span>
          </div>
          <div className="prose dark:prose-invert max-w-none w-full">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {String(children).replace(/\n$/, "")}
            </ReactMarkdown>
          </div>
        </Card>
      );
    }

    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={vscDarkPlus as any}
        language={match[1]}
        PreTag="div"
        className="rounded-lg overflow-hidden my-5 border"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code
        className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono text-primary"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }: any) => <>{children}</>,
  h1: ({ node, ...props }: any) => (
    <h2 className="text-3xl font-bold mt-12 mb-6 pb-2 border-b" {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h3 className="text-2xl font-bold mt-10 mb-4" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h4 className="text-xl font-bold mt-8 mb-4" {...props} />
  ),
  a: ({ node, ...props }: any) => (
    <a
      className="text-primary hover:text-primary/80 underline font-medium inline-flex items-center gap-1 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {props.children}
      <ExternalLink className="h-3 w-3" />
    </a>
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="list-disc pl-6 my-4 space-y-2" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />
  ),
  p: ({ node, ...props }: any) => (
    <p className="leading-7 not-first:mt-6 text-foreground/90" {...props} />
  ),
};

export function ConceptView({ trackSlug, conceptSlug }: ConceptViewProps) {
  const {
    data: concept,
    isLoading,
    error,
  } = useTrackConceptQuery(trackSlug, conceptSlug);

  useEffect(() => {
    window.scrollTo({ top: 10, behavior: "auto" });
  }, [trackSlug, conceptSlug]);

  const { markdown, referenceLinks } = useMemo(() => {
    const combinedMarkdown = `${concept?.introduction ?? ""}\n\n---\n\n${concept?.about ?? ""}`;
    return {
      markdown: combinedMarkdown,
      referenceLinks: extractReferenceLinks(combinedMarkdown),
    };
  }, [concept?.about, concept?.introduction]);

  return (
    <QueryGuard
      loading={isLoading}
      error={error}
      data={concept}
      skeleton={<ConceptViewSkeleton />}
      emptyIcon={BookOpen}
      emptyTitle="Concept Not Found"
      emptyMessage="The requested concept documentation could not be retrieved."
    >
      {(concept) => (
        <div className="w-full max-w-4xl mx-auto py-8">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-foreground capitalize">
              {concept.name}
            </h1>
            <p className="text-muted-foreground">Concept Documentation</p>
          </div>

          <div className="prose dark:prose-invert max-w-none w-full">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {markdown}
            </ReactMarkdown>
          </div>

          {referenceLinks.length > 0 && (
            <div className="mt-12 pt-6 border-t">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-bold">Learn more</h3>
                <Badge variant="secondary" className="py-1">
                  {referenceLinks.length} links
                </Badge>
              </div>
              <ul className="flex flex-wrap gap-3">
                {referenceLinks.map((link) => (
                  <li key={link.label} className="list-none">
                    <Badge variant="outline" className="px-3 py-1.5">
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline font-medium transition-colors"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="h-3 w-3 mb-0.5" />
                      </a>
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </QueryGuard>
  );
}
