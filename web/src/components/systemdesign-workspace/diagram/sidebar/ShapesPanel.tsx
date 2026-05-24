import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { GeoShapeGeoStyle, useValue } from "tldraw";
import { cn } from "@/lib/utils";
import {
  MousePointer2,
  Hand,
  Eraser,
  Square,
  Circle,
  Triangle,
  Diamond,
  Pentagon,
  Hexagon,
  Octagon,
  Star,
  Cloud,
  Heart,
  SquareX,
  SquareCheck,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Minus,
  MoveUpRight,
  Type,
  Pencil,
  Highlighter,
  Wand2,
  StickyNote,
  Frame,
  Disc,
  RectangleHorizontal,
  SquareDashed,
} from "lucide-react";

const BASIC_SHAPES = [
  // Core Tools
  { id: "select", label: "Select", icon: MousePointer2, tool: "select" },
  { id: "hand", label: "Pan", icon: Hand, tool: "hand" },
  { id: "eraser", label: "Eraser", icon: Eraser, tool: "eraser" },
  { id: "text", label: "Text", icon: Type, tool: "text" },

  // Drawing Tools
  { id: "draw", label: "Draw", icon: Pencil, tool: "draw" },
  { id: "highlight", label: "Highlight", icon: Highlighter, tool: "highlight" },
  { id: "laser", label: "Laser", icon: Wand2, tool: "laser" },
  { id: "line", label: "Line", icon: Minus, tool: "line" },

  // Base Geometry
  { id: "arrow", label: "Line Arrow", icon: MoveUpRight, tool: "arrow" },
  { id: "rectangle", label: "Rectangle", icon: Square, tool: "geo", geo: "rectangle" },
  { id: "ellipse", label: "Ellipse", icon: Circle, tool: "geo", geo: "ellipse" },
  { id: "triangle", label: "Triangle", icon: Triangle, tool: "geo", geo: "triangle" },

  // Polygons
  { id: "diamond", label: "Diamond", icon: Diamond, tool: "geo", geo: "diamond" },
  { id: "hexagon", label: "Hexagon", icon: Hexagon, tool: "geo", geo: "hexagon" },
  { id: "octagon", label: "Octagon", icon: Octagon, tool: "geo", geo: "octagon" },
  { id: "pentagon", label: "Pentagon", icon: Pentagon, tool: "geo", geo: "pentagon" },

  // Fun Shapes
  { id: "star", label: "Star", icon: Star, tool: "geo", geo: "star" },
  { id: "cloud", label: "Cloud", icon: Cloud, tool: "geo", geo: "cloud" },
  { id: "heart", label: "Heart", icon: Heart, tool: "geo", geo: "heart" },
  { id: "oval", label: "Oval", icon: Disc, tool: "geo", geo: "oval" },

  // Unique Geometry
  { id: "rhombus", label: "Rhombus", icon: RectangleHorizontal, tool: "geo", geo: "rhombus" },
  { id: "trapezoid", label: "Trapezoid", icon: SquareDashed, tool: "geo", geo: "trapezoid" },
  { id: "x-box", label: "X-Box", icon: SquareX, tool: "geo", geo: "x-box" },
  { id: "check-box", label: "Check-Box", icon: SquareCheck, tool: "geo", geo: "check-box" },

  // Block Arrows
  { id: "arrow-left", label: "Block Arrow Left", icon: ArrowLeft, tool: "geo", geo: "arrow-left" },
  { id: "arrow-up", label: "Block Arrow Up", icon: ArrowUp, tool: "geo", geo: "arrow-up" },
  { id: "arrow-down", label: "Block Arrow Down", icon: ArrowDown, tool: "geo", geo: "arrow-down" },
  { id: "arrow-right", label: "Block Arrow Right", icon: ArrowRight, tool: "geo", geo: "arrow-right" },

  // Utilities
  { id: "note", label: "Sticky Note", icon: StickyNote, tool: "note" },
  { id: "frame", label: "Frame", icon: Frame, tool: "frame" },
];

interface ShapesPanelProps {
  editor: any;
}

export function ShapesPanel({ editor }: ShapesPanelProps) {
  // Track current tool and selected geometry shape to highlight active buttons
  const currentTool = useValue("current tool", () => editor?.getCurrentToolId?.(), [editor]);
  const currentGeo = useValue(
    "current geo",
    () => editor?.getStyleForNextShape?.(GeoShapeGeoStyle),
    [editor]
  );

  const handleSelectShape = (shape: typeof BASIC_SHAPES[0]) => {
    if (!editor) return;

    editor.run(() => {
      editor.setCurrentTool(shape.tool);
      if (shape.geo) {
        editor.setStyleForNextShapes(GeoShapeGeoStyle, shape.geo);
      }
    });
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-3">
        {/* Basic Shapes */}
        <div className="mb-6">
          <div className="text-[11px] font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wider">
            Basic Shapes
          </div>
          <div className="grid grid-cols-4 gap-1">
            {BASIC_SHAPES.map((shape) => {
              const isActive =
                currentTool === shape.tool &&
                (shape.tool !== "geo" || currentGeo === shape.geo);

              return (
                <Button
                  key={shape.id}
                  variant={isActive ? "secondary" : "outline"}
                  className={cn(
                    "aspect-square p-0 h-auto w-full transition-all group",
                    isActive ? "bg-primary/10 border-primary/30" : ""
                  )}
                  onClick={() => handleSelectShape(shape)}
                  title={shape.label}
                >
                  <shape.icon
                    className={cn(
                      "size-[22px] transition-colors stroke-[1.5]",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
