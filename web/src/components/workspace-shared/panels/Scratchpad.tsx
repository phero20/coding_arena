"use client";

import React, { useState, useEffect, useRef } from "react";
import "@excalidraw/excalidraw/index.css";
import dynamic from "next/dynamic";
import { Rnd } from "react-rnd";
import { X, GripHorizontal, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useProblemTestsQuery } from "@/hooks/queries/use-problem.queries";

// High-contrast accent color for maximum visibility on dark canvas
const ACCENT_COLOR = "#000000"; // Electric Cyan
const Excalidraw = dynamic(
  async () => {
    const mod = await import("@excalidraw/excalidraw");
    return function ExcalidrawWrapper(props: any) {
      return (
        <mod.Excalidraw {...props}>
          <mod.WelcomeScreen>
            <mod.WelcomeScreen.Center>
              <mod.WelcomeScreen.Center.Heading>
                Scratchpad
              </mod.WelcomeScreen.Center.Heading>
              <mod.WelcomeScreen.Center.Menu />
            </mod.WelcomeScreen.Center>
          </mod.WelcomeScreen>
          <mod.MainMenu>
            <mod.MainMenu.DefaultItems.LoadScene />
            <mod.MainMenu.DefaultItems.SaveToActiveFile />
            <mod.MainMenu.DefaultItems.Export />
            <mod.MainMenu.DefaultItems.SaveAsImage />
            <mod.MainMenu.DefaultItems.ClearCanvas />
            <mod.MainMenu.Separator />
            <mod.MainMenu.DefaultItems.ToggleTheme />
            <mod.MainMenu.DefaultItems.ChangeCanvasBackground />
          </mod.MainMenu>
        </mod.Excalidraw>
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-muted/5 animate-pulse">
        <span className="text-xs text-muted-foreground">Loading Canvas...</span>
      </div>
    ),
  },
);

interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
  problem: any;
}

const formatInput = (input: any): string => {
  if (!input || typeof input !== "object") return String(input);
  return Object.entries(input)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");
};

const buildDefaultElements = (problem: any, publicTests: any) => {
  const testCase = publicTests?.cases?.[0];
  let inputText = "";
  if (testCase) {
    inputText = formatInput(testCase.input);
  } else if (problem?.examples?.[0]) {
    inputText = problem.examples[0].example_text || "";
  }
  if (!inputText) return null;

  const seed = Math.floor(Math.random() * 1_000_000);
  const now = Date.now();
  const base = {
    roughness: 0,
    opacity: 100,
    isDeleted: false,
    groupIds: [],
    boundElements: null,
    updated: now,
    link: null,
    locked: false,
  };

  return [
    {
      ...base,
      id: "default-content",
      type: "text",
      x: 50,
      y: 50,
      width: 560,
      height: 200,
      text: inputText,
      fontSize: 32, 
      fontFamily: 2, // Monospace
      textAlign: "center",
      verticalAlign: "center",
      strokeColor: ACCENT_COLOR,
      seed: seed + 4,
      version: 1,
      versionNonce: seed + 5,
    },
  ];
};

const DEFAULT_APP_STATE = {
  currentItemFontFamily: 1,
  viewBackgroundColor: "transparent",
  currentItemStrokeColor: ACCENT_COLOR,
  currentItemStrokeWidth: 1, // Bolder pen
  currentItemOpacity: 40,    // Solid lines
  theme: "dark",
  showLibrary: false,
};

export const Scratchpad: React.FC<ScratchpadProps> = ({
  problem,
  isOpen,
  onClose,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  const [windowState, setWindowState] = useState({
    width: 800,
    height: 550,
    x: 0,
    y: 0,
  });
  const prevWindowState = useRef(windowState);

  useEffect(() => {
    setIsMounted(true);
    const x = Math.max(20, window.innerWidth - 840);
    const y = Math.max(20, window.innerHeight - 650);
    setWindowState((s) => ({ ...s, x, y }));
    prevWindowState.current = { ...windowState, x, y };
  }, []);

  useEffect(() => {
    if (excalidrawAPI) excalidrawAPI.updateScene({});
  }, [windowState, excalidrawAPI]);

  const handleMaximize = () => {
    if (!isMaximized) {
      prevWindowState.current = windowState;
      const p = 24;
      setWindowState({
        x: p,
        y: p,
        width: window.innerWidth - p * 2,
        height: window.innerHeight - p * 2,
      });
    } else {
      setWindowState(prevWindowState.current);
    }
    setIsMaximized((v) => !v);
  };

  const { data: tests } = useProblemTestsQuery(
    problem?.problem_id, 
    "PUBLIC", 
    problem?.problem_id 
      ? !problem.problem_id.includes(":") && problem.problem_id !== "compiler-playground"
      : false
  );
  const publicTests = Array.isArray(tests) ? (tests[0] ?? null) : tests;

  const dataKey = problem?.problem_id
    ? `scratchpad-data-${problem.problem_id}`
    : null;

  // Handle async injection of test cases
  useEffect(() => {
    if (excalidrawAPI && problem?.problem_id && publicTests) {
      const saved = localStorage.getItem(dataKey!);
      if (!saved) {
        const elements = buildDefaultElements(problem, publicTests);
        if (elements) {
          excalidrawAPI.updateScene({
            elements,
            appState: DEFAULT_APP_STATE,
          });
        }
      }
    }
  }, [excalidrawAPI, publicTests, problem?.problem_id, dataKey]);

  const getInitialData = () => {
    if (typeof window === "undefined" || !dataKey)
      return { appState: DEFAULT_APP_STATE };

    const saved = localStorage.getItem(dataKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          appState: { ...DEFAULT_APP_STATE, ...parsed.appState },
        };
      } catch {
        // Corrupted data — fall through to defaults
      }
    }

    const elements = buildDefaultElements(problem, publicTests);
    return {
      elements: elements ?? [],
      appState: DEFAULT_APP_STATE,
      scrollToContent: !!elements,
    };
  };

  const handleCanvasChange = (elements: any, appState: any) => {
    if (dataKey && elements.length > 0) {
      localStorage.setItem(
        dataKey,
        JSON.stringify({
          elements,
          appState: { currentItemFontFamily: appState.currentItemFontFamily },
        }),
      );
    }
  };

  // Remount Excalidraw once publicTests arrive so initialData is built with real data.
  const excalidrawKey = `${problem?.problem_id}-${publicTests ? "ready" : "pending"}`;

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Rnd
          size={{ width: windowState.width, height: windowState.height }}
          position={{ x: windowState.x, y: windowState.y }}
          onDragStop={(_, d) => {
            setWindowState((s) => ({ ...s, x: d.x, y: d.y }));
            window.dispatchEvent(new Event("resize"));
          }}
          onResizeStop={(_, _dir, ref, _delta, position) => {
            setWindowState({
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
              ...position,
            });
            window.dispatchEvent(new Event("resize"));
          }}
          dragHandleClassName="drag-handle"
          minWidth={400}
          minHeight={300}
          bounds="window"
          className="fixed z-[100] !pointer-events-auto"
          enableResizing={!isMaximized}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="w-full h-full shadow-2xl rounded-xl overflow-hidden border border-border bg-background backdrop-blur-xs flex flex-col relative"
          >
            {/* Header */}
            <div className="drag-handle h-12 bg-muted/40 border-b border-border/50 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing shrink-0 select-none">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <GripHorizontal className="size-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/90">
                    Scratchpad
                  </span>
                  <span className="text-[9px] text-muted-foreground font-medium">
                    Infinite Canvas
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMaximize();
                  }}
                  title={isMaximized ? "Restore" : "Maximize"}
                >
                  {isMaximized ? (
                    <Minimize2 className="size-3.5" />
                  ) : (
                    <Maximize2 className="size-3.5" />
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="size-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  title="Close"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative bg-background overflow-hidden">
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                .excalidraw .library-button, .excalidraw .help-button,
                .excalidraw [aria-label*="Library"], .excalidraw [aria-label*="Help"],
                .excalidraw [title*="Library"], .excalidraw [title*="Help"],
                .excalidraw .layer-ui__library-button { display: none !important; }
              `,
                }}
              />
              <Excalidraw
                key={excalidrawKey}
                excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
                theme="dark"
                initialData={getInitialData()}
                onChange={handleCanvasChange}
                UIOptions={{
                  canvasActions: { toggleTheme: false, toggleLibrary: false },
                }}
              />
            </div>

            {!isMaximized && (
              <div className="absolute bottom-1 right-1 pointer-events-none opacity-30">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="21" y1="21" x2="9" y2="21" />
                  <line x1="21" y1="21" x2="21" y2="9" />
                </svg>
              </div>
            )}
          </motion.div>
        </Rnd>
      )}
    </AnimatePresence>
  );
};
