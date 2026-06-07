"use client";

import dynamic from "next/dynamic";

// Loading placeholder for the code block
const HighlightSkeleton = () => (
  <div className="h-40 w-full p-6 space-y-2 bg-muted/20 animate-pulse rounded-lg border border-border/10">
    <div className="h-3 w-3/4 bg-muted/30 rounded" />
    <div className="h-3 w-1/2 bg-muted/30 rounded" />
    <div className="h-3 w-2/3 bg-muted/30 rounded" />
  </div>
);

// Dynamic import of the Syntax Highlighter
export const DynamicHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  {
    ssr: false,
    loading: () => <HighlightSkeleton />,
  }
);
