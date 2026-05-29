"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ExternalLink, Info, Lightbulb, AlertTriangle } from "lucide-react";

// Wraps a code block the same way Exercism.org does:
// - plain text blocks → borderless monospace box with word-wrap
// - exercism/note etc. → callout card
// - inline code → subtle blue chip
function CodeBlock({ node, className, children, ...props }: any) {
  const originalString = String(children);
  const content = originalString.replace(/\n$/, "");
  const fullMatch = /language-(.+)/.exec(className || "");
  const lang = fullMatch ? fullMatch[1] : null;

  // ReactMarkdown v9 removed the `inline` prop.
  // A code node is a block if it has a language class (fenced block) or contains a newline.
  const isBlock = lang !== null || originalString.includes("\n");

  // ─── exercism/note | exercism/caution | exercism/advanced ───
  if (isBlock && lang && lang.startsWith("exercism/")) {
    const type = lang.split("/")[1];
    const isAdvanced = type === "advanced";
    const isCaution = type === "caution";

    const border = isAdvanced
      ? "border-primary/50"
      : isCaution
        ? "border-destructive/50"
        : "border-border";
    const bg = isAdvanced
      ? "bg-primary/5"
      : isCaution
        ? "bg-destructive/5"
        : "bg-muted/30";
    const iconColor = isAdvanced
      ? "text-primary"
      : isCaution
        ? "text-destructive"
        : "text-muted-foreground";
    const title = isAdvanced ? "Advanced Concept" : isCaution ? "Caution" : "Note";
    const Icon = isAdvanced ? Lightbulb : isCaution ? AlertTriangle : Info;

    return (
      <div
        className={`my-4 rounded-md border ${border} ${bg} px-4 py-3 text-sm`}
      >
        <div className={`flex items-center gap-1.5 mb-1.5 font-semibold text-xs uppercase tracking-wide ${iconColor}`}>
          <Icon className="w-3.5 h-3.5" />
          {title}
        </div>
        <div className="text-foreground/80 leading-relaxed [&_p]:my-1 [&_a]:text-primary [&_a]:underline [&_code]:bg-primary/10 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[0.8em]">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={workspaceMarkdownComponents}>
            {content.replace(/exercism's/gi, "SlaveCode's").replace(/exercism/gi, "SlaveCode")}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  // ─── fenced code block (``` ... ```) ───
  if (isBlock) {
    const isRealLang = lang && lang !== "text" && lang !== "plain";

    if (isRealLang) {
      // Syntax-highlighted block for real programming languages
      return (
        <div className="my-3 w-full rounded-md border border-border/60 bg-card overflow-hidden">
          <SyntaxHighlighter
            style={vscDarkPlus as any}
            language={lang!}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: "12px",
              fontSize: "0.78rem",
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
            {content}
          </SyntaxHighlighter>
        </div>
      );
    }

    // Plain text / no-language block — always wraps, never overflows
    return (
      <div className="my-3 w-full rounded-md border border-border/60 bg-muted/20 overflow-hidden">
        <pre
          className="p-3 text-xs font-mono text-foreground/85 leading-relaxed"
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "break-word" }}
        >
          <code className={lang ? `language-${lang}` : ""}>{content}</code>
        </pre>
      </div>
    );
  }

  // ─── inline code ───
  return (
    <code
      className="bg-[#e9efff] text-[#2d46b9] dark:bg-primary/10 dark:text-primary px-1.5 py-0.5 mx-0.5 rounded text-[0.85em] font-mono font-medium"
      {...props}
    >
      {children}
    </code>
  );
}

export const workspaceMarkdownComponents: any = {
  code: CodeBlock,

  // pre wrapper — ReactMarkdown wraps code blocks in <pre> by default
  // We handle the full block in CodeBlock, so just render children here
  pre: ({ children }: any) => <>{children}</>,

  h1: ({ node, ...props }: any) => (
    <h1
      className="text-xl font-bold mt-6 mb-3 text-primary"
      style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
      {...props}
    />
  ),
  h2: ({ node, ...props }: any) => (
    <h2
      className="text-base font-bold mt-5 mb-2 text-foreground"
      style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
      {...props}
    />
  ),
  h3: ({ node, ...props }: any) => (
    <h3
      className="text-sm font-bold mt-4 mb-1.5 text-foreground"
      style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
      {...props}
    />
  ),
  h4: ({ node, ...props }: any) => (
    <h4
      className="text-sm font-semibold mt-3 mb-1 text-foreground"
      style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
      {...props}
    />
  ),
  p: ({ node, ...props }: any) => (
    <p
      className="mt-3 first:mt-0 leading-6 text-foreground/85"
      style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
      {...props}
    />
  ),
  a: ({ node, href, children, ...props }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:text-primary/80 inline-flex items-center gap-0.5 transition-colors"
      {...props}
    >
      {children}
      <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-70" />
    </a>
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="mt-3 pl-5 space-y-1 list-disc text-foreground/85 [&>li]:leading-6" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="mt-3 pl-5 space-y-1 list-decimal text-foreground/85 [&>li]:leading-6" {...props} />
  ),
  li: ({ node, ...props }: any) => (
    <li style={{ overflowWrap: "break-word", wordBreak: "break-word" }} {...props} />
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="mt-3 border-l-4 border-border pl-4 text-muted-foreground italic" {...props} />
  ),
  hr: () => <hr className="my-5 border-border/50" />,
  strong: ({ node, ...props }: any) => <strong className="font-semibold text-foreground" {...props} />,
  em: ({ node, ...props }: any) => <em className="italic text-foreground/80" {...props} />,
  table: ({ node, ...props }: any) => (
    <div className="my-4 w-full overflow-x-auto rounded-md border border-border/60">
      <table className="w-full text-sm border-collapse" {...props} />
    </div>
  ),
  thead: ({ node, ...props }: any) => <thead className="bg-muted/50" {...props} />,
  th: ({ node, ...props }: any) => (
    <th className="border-b border-border px-4 py-2 text-left font-semibold text-foreground" {...props} />
  ),
  td: ({ node, ...props }: any) => (
    <td className="border-b border-border/40 px-4 py-2 text-foreground/80" {...props} />
  ),
};
