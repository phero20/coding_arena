"use client";

import { Tldraw, createShapeId, AssetRecordType } from "tldraw";
import "tldraw/tldraw.css";
import { SystemDesignShapeUtil } from "./SystemDesignShape";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Layers,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InsertMenu } from "./sidebar/InsertMenu";
import { IconLibrary } from "./sidebar/IconLibrary";
import { ComingSoonPlaceholder } from "./sidebar/ComingSoonPlaceholder";
import { LayersPanel } from "./sidebar/LayersPanel";
import { ShapesPanel } from "./sidebar/ShapesPanel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const customShapeUtils = [SystemDesignShapeUtil];

interface DiagramCanvasProps {
  onEditorReady?: (editor: any) => void;
}

const TOOL_ITEMS = [
  { id: "insert", icon: Plus, label: "Insert" },
  { id: "layers", icon: Layers, label: "Layers" },
] as const;

type ToolId = (typeof TOOL_ITEMS)[number]["id"];

export function DiagramCanvas({ onEditorReady }: DiagramCanvasProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [editor, setEditor] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTool, setActiveTool] = useState<ToolId>("insert");
  const [insertView, setInsertView] = useState<string>("menu");
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const addIconToCanvas = useCallback(
    (assetId: string, name: string) => {
      if (!editor) return;
      const id = createShapeId();
      // Place at center of the current viewport
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

  const handleToolClick = (toolId: ToolId) => {
    if (activeTool === toolId) {
      setPanelOpen(!panelOpen);
    } else {
      setActiveTool(toolId);
      setPanelOpen(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      // Get image dimensions
      const img = new window.Image();
      img.onload = () => {
        const viewportCenter = editor.getViewportPageBounds().center;
        const assetId = AssetRecordType.createId();
        const width = img.width > 500 ? 500 : img.width;
        const height = (width / img.width) * img.height;

        // 1. Create the asset in tldraw's store
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

        // 2. Create the image shape linked to that asset
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
    // Reset input
    e.target.value = "";
  };

  if (!isLoaded) {
    return <div className="w-full h-full bg-background animate-pulse" />;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full h-full flex bg-background overflow-hidden">
        {/* Tool Belt — narrow icon sidebar */}
        <aside className="w-12 shrink-0 border-r bg-card flex flex-col items-center py-2 gap-1 z-10">
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
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </aside>

        {/* Contextual Panel */}
        {panelOpen && (
          <aside className="w-72 shrink-0 border-r bg-card flex flex-col z-10">
            {/* Panel Header */}
            <div className="h-10 px-3 flex items-center justify-between border-b shrink-0">
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
                  {TOOL_ITEMS.find((t) => t.id === activeTool)?.label}
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

            {/* Hidden file input for Image Upload */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />

            {/* Insert Master Menu */}
            {activeTool === "insert" && insertView === "menu" && (
              <InsertMenu
                onNavigate={(view) => setInsertView(view as any)}
                onUploadClick={() => fileInputRef.current?.click()}
              />
            )}

            {/* Icons Search & Grid View */}
            {activeTool === "insert" && insertView === "icons" && (
              <IconLibrary onIconClick={addIconToCanvas} />
            )}

            {/* Shapes Panel */}
            {activeTool === "insert" && insertView === "shapes" && (
              <ShapesPanel editor={editor} />
            )}

            {/* Placeholders for upcoming features */}
            {activeTool === "insert" &&
              insertView !== "menu" &&
              insertView !== "icons" &&
              insertView !== "shapes" && (
                <ComingSoonPlaceholder featureName={insertView} />
              )}

            {/* Layers placeholder */}
            {activeTool === "layers" && <LayersPanel />}
          </aside>
        )}

        {/* Canvas — takes remaining space */}
        <div className="flex-1 min-w-0 relative">
          <Tldraw
            shapeUtils={customShapeUtils}
            onMount={(ed) => {
              setEditor(ed);
              if (onEditorReady) onEditorReady(ed);
              ed.user.updateUserPreferences({ colorScheme: "dark" });
            }}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}


