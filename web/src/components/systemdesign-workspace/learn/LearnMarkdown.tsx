"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ExternalLink } from "lucide-react";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

// --- Custom Markdown Renderers ---

function CodeBlock({ node, className, children, ...props }: any) {
  const originalString = String(children);
  const content = originalString.replace(/\n$/, "");
  const match = /language-(.+)/.exec(className || "");
  const lang = match ? match[1] : null;

  // ReactMarkdown v9 removed the inline prop. Block if language provided or contains newline.
  const isBlock = lang !== null || originalString.includes("\n");

  if (isBlock) {
    const isRealLang = lang && lang !== "text" && lang !== "plain";

    if (isRealLang) {
      return (
        <div className="dark my-8 w-full rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden text-base">
          <div className="flex items-center px-4 py-2 border-b border-border/50 bg-muted/50">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{lang}</span>
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus as any}
            language={lang}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: "20px",
              fontSize: "0.9rem",
              background: "transparent",
              width: "100%",
              overflowX: "auto",
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

    // Plain text block
    return (
      <div className="my-8 w-full rounded-xl border border-border/50 bg-muted/20 overflow-hidden shadow-sm">
        <pre className="p-5 text-sm font-mono text-foreground/85 leading-relaxed overflow-x-auto">
          <code className={lang ? `language-${lang}` : ""}>{content}</code>
        </pre>
      </div>
    );
  }

  // Inline code
  return (
    <code
      className="bg-primary/10 text-primary px-1.5 py-0.5 mx-0.5 rounded text-[0.85em] font-mono font-medium"
      {...props}
    >
      {children}
    </code>
  );
}

const components: any = {
  code: CodeBlock,
  pre: ({ children }: any) => <>{children}</>,

  h1: ({ node, children, ...props }: any) => {
    const id = String(children).toLowerCase().replace(/[^\w]+/g, "-");
    return <h1 id={id} className="text-3xl md:text-4xl font-extrabold mt-12 mb-6 tracking-tight text-primary scroll-m-24" {...props}>{children}</h1>;
  },
  h2: ({ node, children, ...props }: any) => {
    const id = String(children).toLowerCase().replace(/[^\w]+/g, "-");
    return <h2 id={id} className="text-2xl md:text-3xl font-bold mt-14 mb-6 tracking-tight text-primary border-b border-border/40 pb-2 scroll-m-24" {...props}>{children}</h2>;
  },
  h3: ({ node, children, ...props }: any) => {
    const id = String(children).toLowerCase().replace(/[^\w]+/g, "-");
    return <h3 id={id} className="text-xl md:text-2xl font-semibold mt-10 mb-4 tracking-tight text-foreground scroll-m-24" {...props}>{children}</h3>;
  },
  h4: ({ node, children, ...props }: any) => {
    const id = String(children).toLowerCase().replace(/[^\w]+/g, "-");
    return <h4 id={id} className="text-lg font-semibold mt-8 mb-3 text-foreground scroll-m-24" {...props}>{children}</h4>;
  },

  p: ({ node, ...props }: any) => (
    <p className="text-[17px] leading-relaxed mb-6 text-foreground/70" {...props} />
  ),

  a: ({ node, href, children, ...props }: any) => {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-primary font-medium hover:underline decoration-primary/50 underline-offset-4 transition-colors inline-flex items-center gap-1"
        {...props}
      >
        {children}
        {isExternal && <ExternalLink className="h-3.5 w-3.5 opacity-70 mb-0.5" />}
      </a>
    );
  },

  ul: ({ node, ...props }: any) => (
    <ul className="list-disc pl-6 mb-6 text-foreground/90 space-y-2 text-[17px] marker:text-muted-foreground" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="list-decimal pl-6 mb-6 text-foreground/90 space-y-2 text-[17px] marker:text-muted-foreground" {...props} />
  ),
  li: ({ node, ...props }: any) => (
    <li className="leading-relaxed pl-1" {...props} />
  ),

  blockquote: ({ node, ...props }: any) => (
    <blockquote className="border-l-4 border-primary/40 bg-primary/5 pl-5 py-4 my-8 rounded-r-xl italic text-foreground/80 text-[17px] shadow-sm" {...props} />
  ),

  hr: () => <hr className="my-10 border-border/50" />,

  strong: ({ node, ...props }: any) => <strong className="font-semibold text-foreground" {...props} />,
  em: ({ node, ...props }: any) => <em className="italic text-foreground/80" {...props} />,

  img: ({ node, src, alt, ...props }: any) => (
    <span className="flex flex-col items-center justify-center my-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img width={100} height={100}
        src={src}
        alt={alt}
        className="rounded-xl border border-border/50 shadow-sm max-w-full h-auto max-h-[600px] object-contain bg-muted/20"
        loading="lazy"
        {...props}
      />
      {alt && <span className="text-sm text-muted-foreground mt-3 italic text-center max-w-[80%]">{alt}</span>}
    </span>
  ),

  table: ({ node, ...props }: any) => (
    <div className="my-8 w-full overflow-x-auto rounded-xl border border-border/50 shadow-sm">
      <table className="w-full text-[15px] border-collapse" {...props} />
    </div>
  ),
  thead: ({ node, ...props }: any) => <thead className="bg-muted/40" {...props} />,
  th: ({ node, ...props }: any) => (
    <th className="border-b border-border/50 px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap" {...props} />
  ),
  td: ({ node, ...props }: any) => (
    <td className="border-b border-border/40 px-4 py-3 text-foreground/80" {...props} />
  ),
};

interface LearnMarkdownProps {
  content: string;
  className?: string;
}

export const LearnMarkdown = ({ content, className }: LearnMarkdownProps) => {
  return (
    <div className={cn("w-full max-w-none", className)}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkMath]} 
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
