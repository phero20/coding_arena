"use client";

import { useRef, useCallback, useState } from "react";
import { createShapeId, AssetRecordType } from "tldraw";
import {
  Layers,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ArrowLeft,
  HelpCircle,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InsertMenu } from "./InsertMenu";
import { IconLibrary } from "./IconLibrary";
import { ComingSoonPlaceholder } from "./ComingSoonPlaceholder";
import { LayersPanel } from "./LayersPanel";
import { ShapesPanel } from "./ShapesPanel";
import { CodeDiagramPanel } from "./CodeDiagramPanel";
import { DeviceFramePanel } from "./DeviceFramePanel";
import { TemplatesPanel } from "./TemplatesPanel";
import { SettingsPanel } from "./SettingsPanel";
import { ChatCopilotPanel } from "./ChatCopilotPanel";
import { GlobalSearchResultsPanel } from "./GlobalSearchResultsPanel";
import { useSidebarSearchStore } from "@/store/use-sidebar-search-store";
import { useDiagramStore } from "@/store/use-diagram-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarPanelProps {
  editor: any;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  activeTool: "insert" | "layers" | "settings" | "ai";
  setActiveTool: (tool: "insert" | "layers" | "settings" | "ai") => void;
  insertView: string;
  setInsertView: (view: string) => void;
}

const TOOL_ITEMS = [
  { id: "insert", icon: Plus, label: "Insert" },
  { id: "layers", icon: Layers, label: "Layers" },
  { id: "ai", icon: Sparkles, label: "AI Chat" },
] as const;

export function SidebarPanel({
  editor,
  panelOpen,
  setPanelOpen,
  activeTool,
  setActiveTool,
  insertView,
  setInsertView,
}: SidebarPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { searchQuery, setSearchQuery, isSearching, clearSearch } =
    useSidebarSearchStore();
  const [prefillSearch, setPrefillSearch] = useState("");
  const activeDiagramId = useDiagramStore((state) => state.activeDiagram?.id);

  const handleToolClick = (toolId: "insert" | "layers" | "settings" | "ai") => {
    if (activeTool === toolId) {
      setPanelOpen(!panelOpen);
    } else {
      setActiveTool(toolId);
      setPanelOpen(true);
    }
  };

  const addIconToCanvas = useCallback(
    (assetId: string, name: string) => {
      if (!editor) return;
      const id = createShapeId();
      const viewportCenter = editor.getViewportPageBounds().center;
      editor.createShapes([
        {
          id,
          type: "system-icon",
          x: viewportCenter.x - 40,
          y: viewportCenter.y - 50,
          props: { assetId, label: name },
        },
      ]);
      editor.select(id);
    },
    [editor],
  );

  const addCodeBlockToCanvas = useCallback(() => {
    if (!editor) return;
    const id = createShapeId();
    const viewportCenter = editor.getViewportPageBounds().center;
    editor.createShapes([
      {
        id,
        type: "code-block",
        x: viewportCenter.x - 180,
        y: viewportCenter.y - 40,
        props: {
          w: 360,
          h: 80,
          code: "",
          language: "java",
          fontSize: 14,
        },
      },
    ]);
    editor.select(id);
  }, [editor]);

  const addFigureToCanvas = useCallback(() => {
    if (!editor) return;
    const id = createShapeId();
    const viewportCenter = editor.getViewportPageBounds().center;
    editor.createShapes([
      {
        id,
        type: "frame",
        x: viewportCenter.x - 200,
        y: viewportCenter.y - 150,
        props: {
          w: 400,
          h: 300,
          name: "Group",
        },
      },
    ]);
    editor.sendToBack([id]);
    editor.select(id);
  }, [editor]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new window.Image();
      img.onload = () => {
        const viewportCenter = editor.getViewportPageBounds().center;
        const assetId = AssetRecordType.createId();
        const width = img.width > 500 ? 500 : img.width;
        const height = (width / img.width) * img.height;

        editor.createAssets([
          {
            id: assetId,
            type: "image",
            typeName: "asset",
            props: {
              name: file.name,
              src: dataUrl,
              w: img.width,
              h: img.height,
              mimeType: file.type,
              isAnimated: false,
            },
            meta: {},
          },
        ]);

        editor.createShapes([
          {
            id: createShapeId(),
            type: "image",
            x: viewportCenter.x - width / 2,
            y: viewportCenter.y - height / 2,
            props: {
              w: width,
              h: height,
              assetId: assetId,
            },
          },
        ]);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <TooltipProvider delayDuration={300}>
      {/* Tool Belt — narrow icon sidebar */}
      <aside className="w-12 shrink-0 border-r bg-card flex flex-col items-center py-2 gap-1 z-[9999] sm:z-10">
        {TOOL_ITEMS.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={
                  activeTool === tool.id && panelOpen ? "secondary" : "ghost"
                }
                size="icon"
                className="h-9 w-9"
                onClick={() => handleToolClick(tool.id)}
              >
                <tool.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{tool.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        <div className="flex-1" />
        <Separator className="w-6 my-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setPanelOpen(!panelOpen)}
            >
              {panelOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{panelOpen ? "Collapse panel" : "Expand panel"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={
                activeTool === "settings" && panelOpen ? "secondary" : "ghost"
              }
              size="icon"
              className="h-9 w-9"
              onClick={() => handleToolClick("settings")}
            >
              <Settings
                className={cn(
                  "h-4 w-4",
                  activeTool === "settings" && panelOpen && "text-primary",
                )}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
      </aside>

      {/* Contextual Panel */}
      {panelOpen && (
        <aside className="w-[calc(100vw-3rem)] sm:w-76 shrink-0 border-r bg-card flex flex-col z-[9998] sm:z-10 absolute left-12 sm:relative sm:left-auto top-0 bottom-0 shadow-xl sm:shadow-none">
          {/* Panel Header */}
          <div className="h-9 px-3 flex items-center justify-between border-b shrink-0">
            {activeTool === "insert" && insertView !== "menu" ? (
              <Button
                variant="secondary"
                size="sm"
                className="h-7 px-2 text-xs -ml-2"
                onClick={() => setInsertView("menu")}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            ) : (
              <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                {activeTool === "settings"
                  ? "Settings"
                  : activeTool === "ai"
                  ? "AI Chat"
                  : TOOL_ITEMS.find((t) => t.id === activeTool)?.label}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setPanelOpen(false)}
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Global Sidebar Search Bar */}
          {activeTool === "insert" && (
            <div className="p-3 pb-2.5 shrink-0 border-b bg-card">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search templates, logos, icons..."
                  className="h-9 pl-9 pr-8 text-xs bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Hidden file input for Image Upload */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />

          {/* Content Rendering Block */}
          {activeTool === "insert" && isSearching ? (
            <GlobalSearchResultsPanel
              editor={editor}
              onIconClick={addIconToCanvas}
              onNavigateToView={(view, subSearch) => {
                if (subSearch) {
                  setPrefillSearch(subSearch);
                } else {
                  setPrefillSearch("");
                }
                clearSearch();
                setInsertView(view);
              }}
            />
          ) : (
            <>
              {/* Insert Master Menu */}
              {activeTool === "insert" && insertView === "menu" && (
                <InsertMenu
                  onNavigate={(view) => {
                    if (view === "code-block") {
                      addCodeBlockToCanvas();
                    } else if (view === "figure") {
                      addFigureToCanvas();
                    } else if (view === "ai-chat") {
                      // Open the AI Chat as a top-level tab
                      setActiveTool("ai");
                      setPanelOpen(true);
                    } else {
                      setInsertView(view);
                    }
                  }}
                  onUploadClick={() => fileInputRef.current?.click()}
                />
              )}

              {/* Icons Search & Grid View */}
              {activeTool === "insert" && insertView === "icons" && (
                <IconLibrary
                  onIconClick={addIconToCanvas}
                  initialSearchQuery={prefillSearch}
                />
              )}

              {/* Shapes Panel */}
              {activeTool === "insert" && insertView === "shapes" && (
                <ShapesPanel editor={editor} />
              )}

              {/* Diagram as Code Panel */}
              {activeTool === "insert" && insertView === "code-diagram" && (
                <CodeDiagramPanel editor={editor} />
              )}

              {/* Device Frames Panel */}
              {activeTool === "insert" && insertView === "devices" && (
                <DeviceFramePanel editor={editor} />
              )}

              {/* Templates Panel */}
              {activeTool === "insert" && insertView === "templates" && (
                <TemplatesPanel
                  editor={editor}
                  onNavigateBack={() => setInsertView("menu")}
                />
              )}

              {/* Placeholders for upcoming features */}
              {activeTool === "insert" &&
                insertView !== "menu" &&
                insertView !== "icons" &&
                insertView !== "shapes" &&
                insertView !== "devices" &&
                insertView !== "templates" &&
                insertView !== "code-diagram" && (
                  <ComingSoonPlaceholder featureName={insertView} />
                )}
            </>
          )}

          {/* Layers tab */}
          {activeTool === "layers" && <LayersPanel editor={editor} />}

          {/* AI Chat tab */}
          {activeTool === "ai" && <ChatCopilotPanel key={activeDiagramId} editor={editor} />}

          {/* Settings panel */}
          {activeTool === "settings" && <SettingsPanel editor={editor} />}
        </aside>
      )}
    </TooltipProvider>
  );
}
