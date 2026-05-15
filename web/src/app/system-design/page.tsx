"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Share2, Undo2, Redo2, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const DiagramCanvas = dynamic(
  () => import("@/components/diagram/DiagramCanvas").then((mod) => mod.DiagramCanvas),
  { ssr: false }
);

export default function DiagramPage() {
  const [editor, setEditor] = useState<any>(null);

  const handleExport = () => {
    if (!editor) return;
    const snapshot = editor.getSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arena-diagram-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Header — Clean, minimal like Eraser.io */}
      <header className="h-12 border-b flex items-center justify-between px-4 bg-card">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Home
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-xs text-muted-foreground">
            Untitled Diagram
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor?.undo()}
            disabled={!editor}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor?.redo()}
            disabled={!editor}
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-xs"
            onClick={handleExport}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button size="sm" className="h-7 gap-1.5 px-3 text-xs">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      </header>

      {/* Canvas */}
      <main className="flex-1 overflow-hidden">
        <DiagramCanvas onEditorReady={setEditor} />
      </main>
    </div>
  );
}
