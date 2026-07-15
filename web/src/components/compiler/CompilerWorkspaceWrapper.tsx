"use client";

import dynamic from "next/dynamic";
import { CompilerWorkspaceSkeleton } from "@/components/skeletons/WorkspaceSkeletons";

// Dynamically import the heavy workspace and explicitly disable SSR.
// This prevents Next.js from attempting to render Monaco Editor on the server,
// which causes extreme TTFB delays.
const CompilerWorkspace = dynamic(
  () => import("./CompilerWorkspace").then((mod) => mod.CompilerWorkspace),
  { 
    ssr: false,
    loading: () => <CompilerWorkspaceSkeleton />
  }
);

export function CompilerWorkspaceWrapper() {
  return <CompilerWorkspace />;
}
