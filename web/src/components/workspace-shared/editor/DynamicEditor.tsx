"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Loading placeholder for the editor
const EditorSkeleton = () => (
  <div className="h-full w-full p-4 space-y-3 bg-muted/20 animate-pulse">
    <div className="h-4 w-1/3 bg-muted/40 rounded" />
    <div className="h-4 w-1/2 bg-muted/40 rounded" />
    <div className="h-full w-full bg-muted/40 rounded-lg" />
  </div>
);

// Dynamic import of the Monaco Editor
export const DynamicEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <EditorSkeleton />,
  }
);
