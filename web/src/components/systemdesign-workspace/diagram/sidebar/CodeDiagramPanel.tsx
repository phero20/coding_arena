"use client";

import { useState } from "react";
import {
  RotateCcw,
  HelpCircle,
  Settings2,
  Layout,
  Sliders,
  ArrowRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateDiagramFromCode } from "./utils/code-diagram-generator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Editor from "@monaco-editor/react";
import { Input } from "@/components/ui/input";

interface CodeDiagramPanelProps {
  editor: any;
}

const TEMPLATE_CODE = `title Architecture Diagram
direction right

API gateway [icon: aws-api-gateway]
Lambda [icon: aws-lambda]
S3 [icon: aws-simple-storage-service]

VPC Subnet [icon: aws-vpc] {
  Main Server {
    Server [icon: aws-ec2]
    Data [icon: aws-rds]
  }

  Queue [icon: aws-auto-scaling]

  Compute Nodes {
    Worker1 [icon: aws-ec2]
    Worker2 [icon: aws-ec2]
    Worker3 [icon: aws-ec2]
  }
}

Analytics [icon: aws-redshift]

API gateway > Lambda > Server > Data
Server > Queue
Queue > Worker1, Worker2, Worker3
S3 < Data
Compute Nodes > Analytics`;

export function CodeDiagramPanel({ editor }: CodeDiagramPanelProps) {
  const [code, setCode] = useState(TEMPLATE_CODE);
  const [direction, setDirection] = useState<"vertical" | "horizontal">(
    "horizontal",
  );
  const [spacing, setSpacing] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const handleEditorDidMount = (editorInstance: any, monaco: any) => {
    monaco.languages.register({ id: "system-diagram" });

    monaco.languages.setMonarchTokensProvider("system-diagram", {
      tokenizer: {
        root: [
          [/\/\/.*$/, "comment"],
          [/->/, "keyword"],
          [/\[/, { token: "delimiter.bracket", next: "@attributes" }],
          [/[a-zA-Z0-9_-]+/, "type.identifier"],
        ],
        attributes: [
          [/\]/, { token: "delimiter.bracket", next: "@pop" }],
          [/[a-zA-Z0-9_-]+(?=\s*:)/, "attribute.name"],
          [/:/, "delimiter"],
          [/"[^"]*"/, "string"],
          [/[a-zA-Z0-9_-]+/, "attribute.value"],
          [/,/, "delimiter"],
        ],
      },
    });

    monaco.editor.defineTheme("diagram-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6a9955", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6", fontStyle: "bold" },
        { token: "type.identifier", foreground: "4fc1ff", fontStyle: "bold" },
        { token: "attribute.name", foreground: "dcdcaa" },
        { token: "attribute.value", foreground: "9cdcfe" },
        { token: "string", foreground: "ce9178" },
      ],
      colors: {
        "editor.background": "#121214",
        "editor.lineHighlightBackground": "#ffffff0a",
      },
    });

    monaco.editor.setTheme("diagram-theme");
  };

  const handleGenerate = async () => {
    if (!editor) {
      setError('Diagram editor is not ready yet.');
      return;
    }
    try {
      setError(null);
      await generateDiagramFromCode(code, editor, direction, spacing, setError);
    } catch (e: any) {
      setError(e.message || 'Failed to parse diagram syntax.');
    }
  };
;

  const handleReset = () => {
    setCode(TEMPLATE_CODE);
    setError(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 pb-1">
            <div className="flex flex-col">
              <span className="text-xs font-semibold leading-tight text-foreground">
                Diagram Editor
              </span>
              <span className="text-[10px] text-muted-foreground">
                Type text to spawn interactive diagrams
              </span>
            </div>
            <div className="flex-1" />
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-foreground"
                  >
                    <HelpCircle className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="!bg-popover !text-popover-foreground border border-border shadow-md p-3.5 w-72 rounded-md space-y-2 z-999"
                >
                  <div className="font-semibold text-sm">Syntax Reference</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Define your system layout programmatically using simple node
                    and edge configurations.
                  </p>
                  <div className="space-y-1.5 pt-1">
                    <div className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                      Nodes
                    </div>
                    <pre className="p-2 rounded bg-background/50 font-mono text-[10px] text-foreground border border-border">
                      id [label: "Name", icon: tech]
                    </pre>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                      Connectors
                    </div>
                    <pre className="p-2 rounded bg-background/50 font-mono text-[10px] text-foreground border border-border">
                      id1 -&gt; id2 [label: "label"]
                    </pre>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Text Editor */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground px-1">
              <span>Code Blueprint</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-[10px] gap-1"
                onClick={handleReset}
              >
                <RotateCcw className="size-3" />
                Reset
              </Button>
            </div>

            <div 
              className="h-84 w-full rounded-md border border-input overflow-hidden focus-within:ring-1 focus-within:ring-ring"
              onKeyDownCapture={(e) => e.stopPropagation()}
              onKeyUpCapture={(e) => e.stopPropagation()}
              onKeyPressCapture={(e) => e.stopPropagation()}
            >
              <Editor
                height="100%"
                defaultLanguage="system-diagram"
                theme="diagram-theme"
                value={code}
                onChange={(val) => setCode(val || "")}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  lineNumbers: "on",
                  scrollbar: {
                    vertical: "auto",
                    horizontal: "auto",
                    verticalScrollbarSize: 6,
                    horizontalScrollbarSize: 6,
                  },
                  lineDecorationsWidth: 4,
                  lineNumbersMinChars: 2,
                  padding: { top: 8, bottom: 8 },
                  wordWrap: "on",
                  folding: false,
                  glyphMargin: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  renderLineHighlight: "all",
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                }}
              />
            </div>
          </div>

          {/* Controls & Layout Settings */}
          <div className="space-y-3 bg-muted/10 p-2.5 rounded-lg border border-border">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground pb-0.5">
              <Settings2 className="size-3.5" />
              <span>Layout Settings</span>
            </div>

            {/* Layout Direction */}
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                variant={direction === "horizontal" ? "default" : "secondary"}
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => setDirection("horizontal")}
              >
                <Layout className="size-3.5" />
                Left-Right
              </Button>
              <Button
                variant={direction === "vertical" ? "default" : "secondary"}
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => setDirection("vertical")}
              >
                <Layout className="size-3.5 rotate-90" />
                Top-Down
              </Button>
            </div>

            {/* Layout Spacing */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                <span className="flex items-center gap-1">
                  <Sliders className="size-3" /> Spacing
                </span>
                <span>{spacing.toFixed(1)}x</span>
              </div>
              <Input
                type="range"
                min="0.8"
                max="2.0"
                step="0.1"
                value={spacing}
                onChange={(e) => setSpacing(parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-[11px] leading-relaxed font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Generate Button */}
          <Button onClick={handleGenerate} className="w-full">
            Generate whiteboard
            <ArrowRight />
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
