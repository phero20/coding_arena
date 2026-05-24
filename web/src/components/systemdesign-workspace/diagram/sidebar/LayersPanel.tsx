"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ChevronRight,
  ChevronDown,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  Type,
  Square,
  Circle,
  HelpCircle,
  Image as ImageIcon,
  Compass,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LayersPanelProps {
  editor: any;
}

export function LayersPanel({ editor }: LayersPanelProps) {
  const [rawShapes, setRawShapes] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null);

  // Load persistent expand fold state
  useEffect(() => {
    if (!editor) return;
    const pageId = editor.getCurrentPageId();
    try {
      const saved = localStorage.getItem(`expanded-layers-${pageId}`);
      if (saved) {
        setExpandedParents(JSON.parse(saved));
      }
    } catch (e) {}
  }, [editor]);

  // Persistent expand state modifier
  const toggleExpandPersistent = (shapeId: string) => {
    setExpandedParents((prev) => {
      const next = { ...prev, [shapeId]: !prev[shapeId] };
      if (editor) {
        const pageId = editor.getCurrentPageId();
        try {
          localStorage.setItem(`expanded-layers-${pageId}`, JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  };

  // Sync raw shapes in real-time
  useEffect(() => {
    if (!editor) return;

    const handleSync = () => {
      setRawShapes(editor.getCurrentPageShapesSorted());
    };

    editor.on("change", handleSync);
    handleSync();

    return () => {
      editor.off("change", handleSync);
    };
  }, [editor]);

  // Compute nested hierarchy tree dynamically
  const shapes = useMemo(() => {
    if (!editor || rawShapes.length === 0) return [];
    
    const childrenMap: Record<string, any[]> = {};
    const roots: any[] = [];
    const pageId = editor.getCurrentPageId();

    rawShapes.forEach((shape: any) => {
      const parentId = shape.parentId;
      const isRoot = parentId === pageId;
      
      if (isRoot) {
        roots.push(shape);
      } else {
        if (!childrenMap[parentId]) {
          childrenMap[parentId] = [];
        }
        childrenMap[parentId].push(shape);
      }
    });

    roots.reverse();
    
    const flatList: any[] = [];
    
    const getDepth = (shape: any) => {
      let depth = 0;
      let currParentId = shape.parentId;
      while (currParentId && currParentId !== pageId) {
        depth++;
        const parentShape = rawShapes.find((s: any) => s.id === currParentId);
        currParentId = parentShape ? parentShape.parentId : null;
      }
      return depth;
    };

    const traverse = (shape: any, isParentExpanded = true) => {
      const depth = getDepth(shape);
      const children = childrenMap[shape.id] || [];
      const isContainer = children.length > 0 || shape.type === "frame" || shape.type === "group";

      flatList.push({
        ...shape,
        depth,
        isCurrentlyVisible: isParentExpanded,
        isContainer
      });
      
      const isThisExpanded = expandedParents[shape.id] === true;
      
      const sortedChildren = [...children].reverse();
      sortedChildren.forEach((child) => {
        traverse(child, isParentExpanded && isThisExpanded);
      });
    };
    
    roots.forEach((root) => {
      traverse(root);
    });

    return flatList;
  }, [rawShapes, expandedParents, editor]);

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-muted-foreground select-none">
        <div className="text-center space-y-2">
          <Layers className="h-8 w-8 text-muted-foreground/30 mx-auto" />
          <p className="text-xs">Initializing canvas session...</p>
        </div>
      </div>
    );
  }

  // Helper to determine parent type
  const isPageParent = (parentId: string) => {
    return parentId === editor.getCurrentPageId();
  };

  // Helper to get visual display name
  const getShapeDisplayName = (shape: any) => {
    if (shape.props?.name) return shape.props.name;
    if (shape.props?.text) return shape.props.text.trim() || `${shape.type.charAt(0).toUpperCase() + shape.type.slice(1)} Label`;
    
    // Capitalized fallback
    return shape.type.charAt(0).toUpperCase() + shape.type.slice(1);
  };

  // Helper to update display name
  const updateShapeDisplayName = (shape: any, newName: string) => {
    if (!newName.trim()) return;

    if (shape.props && "name" in shape.props) {
      editor.updateShape({ id: shape.id, props: { name: newName } });
    } else if (shape.props && "text" in shape.props) {
      editor.updateShape({ id: shape.id, props: { text: newName } });
    } else {
      editor.updateShape({ id: shape.id, props: { text: newName } });
    }
    setEditingId(null);
  };

  // Icon mapping depending on shape type
  const getShapeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type className="h-3.5 w-3.5 text-primary" />;
      case "geo":
        return <Square className="h-3.5 w-3.5 text-primary" />;
      case "ellipse":
        return <Circle className="h-3.5 w-3.5 text-primary" />;
      case "arrow":
        return <LinkIcon className="h-3.5 w-3.5 text-primary" />;
      case "image":
        return <ImageIcon className="h-3.5 w-3.5 text-primary" />;
      case "note":
        return <Compass className="h-3.5 w-3.5 text-primary" />;
      default:
        return <Square className="h-3.5 w-3.5 text-primary" />;
    }
  };

  // Lock handler
  const handleToggleLock = (e: React.MouseEvent, shape: any) => {
    e.stopPropagation();
    editor.updateShapes([{ id: shape.id, isLocked: !shape.isLocked }]);
  };

  // Visibility handler (Using opacity state natively supported by tldraw layout stack)
  const handleToggleVisibility = (e: React.MouseEvent, shape: any) => {
    e.stopPropagation();
    const currentOpacity = shape.opacity ?? 1;
    const nextOpacity = currentOpacity < 0.2 ? 1 : 0.05;
    editor.updateShapes([{ id: shape.id, opacity: nextOpacity }]);
  };

  // Delete layer
  const handleDeleteShape = (e: React.MouseEvent, shapeId: string) => {
    e.stopPropagation();
    editor.deleteShapes([shapeId]);
  };



  // Layer ordering
  const handleOrder = (e: React.MouseEvent, action: "front" | "back" | "forward" | "backward", shapeId: string) => {
    e.stopPropagation();
    switch (action) {
      case "front":
        editor.bringToFront([shapeId]);
        break;
      case "back":
        editor.sendToBack([shapeId]);
        break;
      case "forward":
        editor.bringForward([shapeId]);
        break;
      case "backward":
        editor.sendBackward([shapeId]);
        break;
    }
  };

  // Expand parent container items
  const toggleParentExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Render items
  const renderLayerRow = (shape: any, index: number) => {
    const isEditing = editingId === shape.id;
    const isLocked = shape.isLocked;
    const isHidden = (shape.opacity ?? 1) < 0.2;
    const isSelected = editor.getSelectedShapeIds().includes(shape.id);
    const parentId = shape.parentId;
    const hasParent = !isPageParent(parentId);

    // Hide nested elements whose parent containers are collapsed (default)
    if (shape.isCurrentlyVisible === false) {
      return null;
    }

    // Dynamic color badges for shape types
    const getTypeBadge = (type: string) => {
      switch (type) {
        case "frame":
          return (
            <span className="px-1 py-0.25 text-[7px] font-extrabold uppercase tracking-widest rounded bg-sky-500/10 text-sky-500 border border-sky-500/20 scale-90 select-none">
              Frame
            </span>
          );
        case "group":
          return (
            <span className="px-1 py-0.25 text-[7px] font-extrabold uppercase tracking-widest rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 scale-90 select-none">
              Group
            </span>
          );
        case "text":
          return (
            <span className="px-1 py-0.25 text-[7px] font-extrabold uppercase tracking-widest rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 scale-90 select-none">
              Text
            </span>
          );
        case "geo":
        case "ellipse":
          return (
            <span className="px-1 py-0.25 text-[7px] font-extrabold uppercase tracking-widest rounded bg-violet-500/10 text-violet-500 border border-violet-500/20 scale-90 select-none">
              Shape
            </span>
          );
        case "arrow":
          return (
            <span className="px-1 py-0.25 text-[7px] font-extrabold uppercase tracking-widest rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 scale-90 select-none">
              Link
            </span>
          );
        case "note":
          return (
            <span className="px-1 py-0.25 text-[7px] font-extrabold uppercase tracking-widest rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 scale-90 select-none">
              Note
            </span>
          );
        default:
          return (
            <span className="px-1 py-0.25 text-[7px] font-extrabold uppercase tracking-widest rounded bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/20 scale-90 select-none">
              Node
            </span>
          );
      }
    };

    // Render multi-level figma dotted layout guidelines
    const renderIndentGuides = () => {
      const guides = [];
      for (let i = 0; i < shape.depth; i++) {
        guides.push(
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px border-l border-dashed border-muted-foreground/15 ml-0.5"
            style={{ left: `${i * 12 + 12}px` }}
          />
        );
      }
      return guides;
    };

    const isThisExpanded = expandedParents[shape.id] === true;

    // Tailored padding classes to avoid dynamic style calculations
    const getPaddingClass = (depth: number) => {
      switch (depth) {
        case 0: return "pl-2";
        case 1: return "pl-6";
        case 2: return "pl-9";
        case 3: return "pl-12";
        case 4: return "pl-[60px]";
        default: return "pl-[72px]";
      }
    };

    return (
      <div key={shape.id} className="relative flex items-center min-w-0">
        {/* Dotted nesting indicator lines */}
        {renderIndentGuides()}

        <div
          onClick={(e) => {
            e.stopPropagation();

            // 1. Toggle parent container collapsed/expanded state persistently first
            if (shape.isContainer) {
              toggleExpandPersistent(shape.id);
            }

            // 2. Select shape on canvas
            editor.select(shape.id);
            editor.zoomToShapes([shape.id]);
          }}
          className={`group relative flex items-center justify-between gap-2.5 h-8 px-2.5 text-xs transition-all cursor-pointer flex-1 rounded-md min-w-0 overflow-hidden ${getPaddingClass(
            shape.depth
          )} ${
            isSelected
              ? "bg-accent text-accent-foreground font-semibold shadow-xs"
              : "hover:bg-muted/50 text-foreground"
          }`}
        >
          {/* Main Content Area */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0 select-none pr-28">
            {/* Collapse Icon if it's a frame/group container */}
            {shape.isContainer ? (
              <div className="p-0.5 rounded shrink-0">
                {isThisExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
            ) : (
              // Blank spacer to align titles perfectly
              <div className="w-4 h-4 shrink-0" />
            )}

            {/* Visual Type Badge */}
            <div className="shrink-0 flex items-center">
              {getTypeBadge(shape.type)}
            </div>

            {/* Display / Editable Name */}
            <div className="flex-1 min-w-0 overflow-hidden">
              {isEditing ? (
                <Input
                  value={editName}
                  autoFocus
                  className="h-5.5 py-0 px-1.5 text-[11px] bg-background border w-full"
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => updateShapeDisplayName(shape, editName)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateShapeDisplayName(shape, editName);
                    }
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(shape.id);
                    setEditName(getShapeDisplayName(shape));
                  }}
                  className={`block truncate select-none font-medium tracking-tight text-[11px] ${
                    isHidden ? "text-muted-foreground/30 line-through" : ""
                  }`}
                >
                  {getShapeDisplayName(shape)}
                </span>
              )}
            </div>
          </div>

          {/* Absolute Actions Overlay - maintains zero width layout jumps */}
          <div className="absolute right-2.5 flex items-center justify-end h-full select-none">
            {/* Index tag - disappears on hover */}
            <span className="text-[9px] font-mono font-bold text-muted-foreground/30 group-hover:opacity-0 transition-opacity duration-150 select-none">
              #{shapes.length - index}
            </span>

            {/* Action tray - fades in cleanly over index tag on hover */}
            <div className="absolute right-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto flex items-center gap-1 transition-opacity duration-150 bg-inherit pl-2">
              {/* Depth ordering */}
              <div className="flex items-center border rounded bg-background overflow-hidden divide-x">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded-none p-0 hover:bg-muted"
                  title="Bring Forward"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOrder(e, "forward", shape.id);
                  }}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded-none p-0 hover:bg-muted"
                  title="Send Backward"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOrder(e, "backward", shape.id);
                  }}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              {/* Visibility toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 hover:bg-muted"
                title={isHidden ? "Show Layer" : "Hide Layer"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleVisibility(e, shape);
                }}
              >
                {isHidden ? (
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground/60" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </Button>

              {/* Lock toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 hover:bg-muted"
                title={isLocked ? "Unlock Layer" : "Lock Layer"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLock(e, shape);
                }}
              >
                {isLocked ? (
                  <Lock className="h-3.5 w-3.5 text-primary animate-pulse" />
                ) : (
                  <Unlock className="h-3.5 w-3.5 text-muted-foreground/60" />
                )}
              </Button>

              {/* Delete shape */}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 text-destructive hover:bg-destructive/15"
                title="Delete Layer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteShape(e, shape.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-card">
      {/* Title Header */}
      <div className="px-4 py-3 flex flex-col gap-1 border-b shrink-0 bg-card">
        <span className="text-xs font-semibold leading-tight text-foreground">
          Layers & Scene Tree
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5">
          View, lock, hide and arrange drawing elements
        </span>
      </div>

      {/* Layer Stack scroll list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {shapes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/5 mt-4">
            <Layers className="h-7 w-7 text-muted-foreground/20 mb-2" />
            <span className="text-[10px] font-semibold text-muted-foreground/80">
              No elements found
            </span>
            <span className="text-[9px] text-muted-foreground/50 mt-1 leading-normal max-w-[160px]">
              Use drawing tools above to place notes, frames, or shapes!
            </span>
          </div>
        ) : (
          shapes.map((shape, idx) => renderLayerRow(shape, idx))
        )}
      </div>
    </div>
  );
}
