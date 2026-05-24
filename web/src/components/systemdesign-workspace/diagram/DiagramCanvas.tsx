"use client";

import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { SystemDesignShapeUtil } from "./shapes/SystemDesignShape";
import { DeviceShapeUtil } from "./shapes/DeviceShape";
import { CodeBlockShapeUtil } from "./shapes/CodeBlockShape";
import { useEffect, useState } from "react";
import { SidebarPanel } from "./sidebar/SidebarPanel";

const customShapeUtils = [
  SystemDesignShapeUtil,
  DeviceShapeUtil,
  CodeBlockShapeUtil,
];

interface DiagramCanvasProps {
  onEditorReady?: (editor: any) => void;
  isReadOnly?: boolean;
}

export function DiagramCanvas({
  onEditorReady,
  isReadOnly = false,
}: DiagramCanvasProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [editor, setEditor] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<
    "insert" | "layers" | "settings" | "ai"
  >("insert");
  const [insertView, setInsertView] = useState<string>("menu");
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Reactively close sidebar in presentation/read-only mode
  useEffect(() => {
    if (isReadOnly) {
      setPanelOpen(false);
    }
  }, [isReadOnly]);

  useEffect(() => {
    if (editor) {
      editor.updateInstanceState({ isReadonly: isReadOnly });
    }
  }, [editor, isReadOnly]);

  if (!isLoaded) {
    return <div className="w-full h-full bg-background animate-pulse" />;
  }

  return (
    <div className="w-full h-full flex bg-background overflow-hidden relative">
      {!isReadOnly && (
        <SidebarPanel
          editor={editor}
          panelOpen={panelOpen}
          setPanelOpen={setPanelOpen}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          insertView={insertView}
          setInsertView={setInsertView}
        />
      )}

      {/* Canvas — takes remaining space */}
      <div className="flex-1 min-w-0 relative">
        <style>{`
          /* Make Tldraw native frame backgrounds 100% transparent */
          .tl-frame__background,
          .tl-frame-background,
          .tl-frame-background-fill,
          .tl-frame_background,
          .tl-frame__background-fill,
          .tl-frame {
            fill: transparent !important;
            fill-opacity: 0 !important;
            background-color: transparent !important;
            background: transparent !important;
          }

          /* Target the SVG background rects of Tldraw frames specifically */
          .tl-shape[data-shape-type="frame"] rect,
          [data-shape-type="frame"] rect,
          .tl-frame-background rect,
          .tl-frame__background rect {
            fill: transparent !important;
            fill-opacity: 0 !important;
            stroke: rgba(63, 63, 70, 0.6) !important;
            stroke-dasharray: 6 4 !important;
            stroke-width: 2px !important;
          }
          
          /* Customize frame header to look sleek and clean */
          .tl-frame__header,
          .tl-frame-header {
            background-color: transparent !important;
            background: transparent !important;
            border-bottom: none !important;
          }

          .tl-frame__header-label,
          .tl-frame-header-label,
          .tl-frame-label {
            color: #a1a1aa !important; /* text-zinc-400 */
            font-weight: 600 !important;
            font-size: 12px !important;
            font-family: Inter, sans-serif !important;
          }

          /* Slim down Tldraw strokes and connector lines globally */
          :root, .tl-container, .tl-theme__dark, .tl-theme__light, .tl-canvas {
            --tl-stroke-width-s: 1.2px !important;
            --tl-stroke-width-m: 1.8px !important;
            --tl-stroke-width-l: 3px !important;
            --tl-stroke-width-xl: 5px !important;
            
            --stroke-width-s: 1.2px !important;
            --stroke-width-m: 1.8px !important;
            --stroke-width-l: 3px !important;
            --stroke-width-xl: 5px !important;
          }

          /* Direct SVG path overrides for arrow and connector lines */
          .tl-arrow path,
          .tl-shape-arrow path,
          path.tl-arrow,
          [data-shape-type="arrow"] path,
          [data-shape-type="line"] path,
          [data-shape-type="system-icon"] path {
            stroke-width: 1.5px !important;
          }

          /* Free the bottom layout wrapper container so its children position relative to the screen */
          .tlui-layout__bottom,
          .tl-layout__bottom {
            display: contents !important;
            position: static !important;
            pointer-events: none !important;
          }

          /* Position Tldraw native toolbar vertically on the left side, centered vertically */
          .tlui-toolbar-container,
          .tlui-layout .tlui-toolbar,
          .tlui-toolbar,
          .tl-toolbar {
            flex-direction: column !important;
            position: fixed !important;
            bottom: auto !important;
            left: 10px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            right: auto !important;
            border-radius: 12px !important;
            padding: 6px !important;
            display: flex !important;
            height: auto !important;
            max-height: none !important;
            width: auto !important;
            max-width: none !important;
            z-index: 999999 !important;
          }

          .tlui-toolbar__tools,
          .tl-toolbar__tools,
          .tlui-toolbar > div,
          .tl-toolbar > div,
          .tlui-buttons__horizontal,
          .tlui-toolbar__inner {
            flex-direction: column !important;
            gap: 6px !important;
            display: flex !important;
            height: auto !important;
            max-height: none !important;
            width: auto !important;
            max-width: none !important;
          }

          /* Rotate the arrow up-chevron toggle to point right if stacked vertically */
          .tlui-toolbar .tlui-icon[type="chevron-up"] {
            transform: rotate(90deg) !important;
          }

          /* Hide the native shapes tool and chevron shapes expander from the toolbar */
          .tlui-toolbar button[data-tool="geo"],
          .tlui-toolbar button[data-tool^="geo"],
          .tlui-toolbar button:has([type="chevron-up"]),
          .tlui-toolbar button:has(.tlui-icon[type="chevron-up"]),
          .tlui-toolbar button:last-of-type {
            display: none !important;
          }
        `}</style>
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
  );
}
