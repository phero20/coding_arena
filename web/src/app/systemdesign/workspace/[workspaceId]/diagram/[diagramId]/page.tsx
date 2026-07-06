"use client";

import { useState, use, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DiagramCanvas } from "@/components/systemdesign-workspace/diagram/DiagramCanvas";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Upload,
  Share2,
  Undo2,
  Redo2,
  ArrowLeftIcon,
  Cloud,
  Copy,
  Check,
  Bug,
} from "lucide-react";
import { useDiagram } from "@/hooks/queries/use-workspace.queries";
import { useCloneDiagram } from "@/hooks/mutations/use-workspace.mutations";
import { useDiagramAutoSave } from "@/hooks/workspace/use-diagram-auto-save";
import { useDiagramStore } from "@/store/use-diagram-store";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DiagramPageProps {
  params: Promise<{
    workspaceId: string;
    diagramId: string;
  }>;
}

export default function DiagramPage({ params }: DiagramPageProps) {
  const { workspaceId, diagramId } = use(params);
  const [editor, setEditor] = useState<any>(null);
  const [isTransparent, setIsTransparent] = useState(false);

  const router = useRouter();
  const diagramQuery = useDiagram(diagramId);
  const { saveStatus, setActiveDiagram } = useDiagramStore();
  const cloneDiagramMutation = useCloneDiagram();

  useEffect(() => {
    if (diagramQuery.data) {
      setActiveDiagram(diagramQuery.data);
    }
  }, [diagramQuery.data, setActiveDiagram]);

  useEffect(() => {
    return () => {
      setActiveDiagram(null);
    };
  }, [setActiveDiagram]);

  const isOwner = diagramQuery.data?.isOwner === true;

  // Encapsulate all hybrid offline-first saving lifecycle triggers inside our custom hook
  const { flushSave } = useDiagramAutoSave(
    editor,
    diagramId,
    workspaceId,
    diagramQuery.data,
  );

  const handleClone = async () => {
    try {
      const cloned = await cloneDiagramMutation.mutateAsync(diagramId);
      if (cloned && cloned.id) {
        router.push(
          `/systemdesign-workspace/${cloned.workspaceId}/diagram/${cloned.id}`,
        );
      }
    } catch (err) {
      console.error("Cloning failed", err);
    }
  };

  const [copied, setCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterShare = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsShareOpen(true);
  };

  const handleMouseLeaveShare = () => {
    if (isPinned) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setIsShareOpen(false);
    }, 150);
  };

  const handleTriggerClick = () => {
    setIsPinned((prev) => !prev);
    setIsShareOpen((prev) => !prev);
  };

  const handleOpenChange = (open: boolean) => {
    setIsShareOpen(open);
    if (!open) {
      setIsPinned(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied! Share it with anyone to view.");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = () => {
    if (!editor) return;
    const snapshot = editor.getSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${diagramQuery.data?.title || "diagram"}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportFormatted = async (format: "json" | "png" | "svg") => {
    if (!editor) return;

    if (format === "json") {
      handleExport();
      return;
    }

    try {
      const ids = Array.from(editor.getCurrentPageShapeIds());
      if (ids.length === 0) {
        toast.error("Nothing to export! Please draw some shapes first.");
        return;
      }

      if (format === "svg") {
        const svgResult = await editor.getSvgElement(ids, {
          background: !isTransparent,
        });
        if (!svgResult || !svgResult.svg) {
          throw new Error("Could not generate SVG elements.");
        }
        const svgString = new XMLSerializer().serializeToString(svgResult.svg);
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${diagramQuery.data?.title || "diagram"}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const { blob } = await editor.toImage(ids, {
          format: "png",
          background: !isTransparent,
        });
        if (!blob) {
          throw new Error("Could not generate PNG blob.");
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${diagramQuery.data?.title || "diagram"}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success(`Exported successfully as ${format.toUpperCase()}`);
    } catch (err) {
      console.error("Export failed", err);
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const snapshot = JSON.parse(event.target?.result as string);
        editor.loadSnapshot(snapshot);
        toast.success("Diagram imported successfully!");
      } catch (err) {
        console.error("Failed to parse snapshot", err);
        toast.error(
          "Invalid diagram JSON file. Please upload a valid template export.",
        );
      }
    };
    reader.readAsText(file);
    // Reset file input value so same file can be imported again if needed
    e.target.value = "";
  };

  return (
    <QueryGuard
      loading={diagramQuery.isLoading}
      error={diagramQuery.error}
      data={diagramQuery.data}
      errorTitle="Access Denied"
      errorMessage="You do not have access to this diagram, or the url is invalid."
      onRetry={() => {
        window.location.href = `/systemdesign/workspace/${workspaceId}`;
      }}
      retryText="Back to Workspace"
      skeleton={
        <div className="flex h-screen items-center justify-center bg-background text-foreground">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Opening your whiteboard canvas...
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        {/* Header — Clean, minimal like Eraser.io */}
        <header className="h-12 border-b flex items-center justify-between px-1 md:px-4 bg-card shrink-0 select-none">
          <div className="flex items-center gap-1 md:gap-4 min-w-0">
            <Link href={`/systemdesign/workspace/${workspaceId}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-2 sm:px-3"
                onClick={flushSave}
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Back</span>
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-4 shrink-0" />

            {/* Active Diagram Title & Autosave state badge */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-sm font-bold text-foreground truncate max-w-[80px] xs:max-w-[150px] sm:max-w-[300px] md:max-w-[400px]">
                {diagramQuery.data?.title || "Untitled Diagram"}
              </span>
              {isOwner &&
                (saveStatus === "saving" ? (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold tracking-wider select-none shrink-0"
                  >
                    Saving...
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold tracking-wider  select-none shrink-0 flex items-center gap-1 text-muted-foreground"
                  >
                    <Cloud className="h-3 w-3 shrink-0 text-primary" />
                    Saved
                  </Badge>
                ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hidden lg:flex justify-center items-center text-difficulty-medium transition-colors"
                  title="Report an Issue"
                >
                  <Bug className="size-4" />
                </Button>
                <Separator
                  orientation="vertical"
                  className="h-4 mx-1 shrink-0 hidden lg:block"
                />
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

                <Separator
                  orientation="vertical"
                  className="h-4 mx-1 shrink-0"
                />

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs font-semibold sm:px-3"
                  onClick={() =>
                    document.getElementById("import-diagram-file")?.click()
                  }
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Import</span>
                </Button>
                <input
                  type="file"
                  id="import-diagram-file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </>
            )}

            {!isOwner && (
              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1.5 px-3 text-xs font-semibold shrink-0"
                onClick={handleClone}
                disabled={cloneDiagramMutation.isPending}
              >
                <Copy className="h-3.5 w-3.5" />
                {cloneDiagramMutation.isPending
                  ? "Cloning..."
                  : "Clone to Workspace"}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs font-semibold sm:px-3"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-card border text-foreground z-999"
              >
                <DropdownMenuItem
                  onClick={() => handleExportFormatted("svg")}
                  className="cursor-pointer"
                >
                  Export as SVG
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExportFormatted("png")}
                  className="cursor-pointer"
                >
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExportFormatted("json")}
                  className="cursor-pointer"
                >
                  Export as JSON (Backup)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1.5 text-sm select-none">
                  <span className="text-muted-foreground font-medium text-xs">
                    Transparent
                  </span>
                  <Switch
                    checked={isTransparent}
                    onCheckedChange={setIsTransparent}
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Popover open={isShareOpen} onOpenChange={handleOpenChange}>
              <PopoverTrigger asChild>
                <div
                  onMouseEnter={handleMouseEnterShare}
                  onMouseLeave={handleMouseLeaveShare}
                  className="inline-block"
                >
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 px-2 text-xs font-semibold sm:px-3 shrink-0"
                    onClick={handleTriggerClick}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-80 p-4 bg-card border text-foreground z-999"
                onMouseEnter={handleMouseEnterShare}
                onMouseLeave={handleMouseLeaveShare}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold leading-none">
                      Share Diagram
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Invite others to view or duplicate this board.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={
                        typeof window !== "undefined"
                          ? window.location.href
                          : ""
                      }
                      className="h-8 text-[11px] bg-background border px-2.5 flex-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2.5 shrink-0"
                      onClick={handleShare}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-difficulty-easy" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  <div className="rounded border bg-muted/40 p-2.5 text-[10px] text-muted-foreground leading-normal">
                    <span className="font-semibold text-foreground">
                      Access Permissions:
                    </span>{" "}
                    Other users will view this diagram in read-only mode, with
                    the option to clone it to their workspace.
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Canvas */}
        <main className="flex-1 overflow-hidden relative">
          <DiagramCanvas onEditorReady={setEditor} isReadOnly={!isOwner} />
        </main>
      </div>
    </QueryGuard>
  );
}
