"use client";

import { useMemo, useState } from "react";
import { useSidebarSearchStore } from "@/store/use-sidebar-search-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Search, Network } from "lucide-react";
import { PrebuiltTemplate } from "@/constants/diagram-templates";
import { generateTemplateShapes } from "./utils/template-generator";
import { toast } from "sonner";
import { GeoShapeGeoStyle, createShapeId } from "tldraw";
import {
  MousePointer2, Hand, Eraser, Square, Circle, Triangle, Diamond,
  Pentagon, Hexagon, Octagon, Star, Cloud, Heart, SquareX,
  SquareCheck, ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Minus,
  MoveUpRight, Type, Pencil, Highlighter, Wand2, StickyNote, Frame,
  Disc, RectangleHorizontal, SquareDashed, Smartphone, Tablet,
  AppWindow, PanelTop, Laptop, SquareTerminal, Sparkles, Code2,
  LayoutGrid, Shapes, Smile, Braces, Image
} from "lucide-react";

const SHAPE_ICONS: Record<string, any> = {
  MousePointer2, Hand, Eraser, Square, Circle, Triangle, Diamond,
  Pentagon, Hexagon, Octagon, Star, Cloud, Heart, SquareX,
  SquareCheck, ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Minus,
  MoveUpRight, Type, Pencil, Highlighter, Wand2, StickyNote, Frame,
  Disc, RectangleHorizontal, SquareDashed, Smartphone, Tablet,
  AppWindow, PanelTop, Laptop, SquareTerminal, Sparkles, Code2,
  LayoutGrid, Shapes, Smile, Braces, Image
};

interface GlobalSearchResultsPanelProps {
  editor: any;
  onIconClick: (assetId: string, name: string) => void;
  onNavigateToView: (view: string, subSearch?: string) => void;
}

export function GlobalSearchResultsPanel({
  editor,
  onIconClick,
  onNavigateToView,
}: GlobalSearchResultsPanelProps) {
  const { searchQuery, searchResults, clearSearch } = useSidebarSearchStore();
  const [injectingId, setInjectingId] = useState<string | null>(null);

  const handleTemplateInsert = async (template: PrebuiltTemplate) => {
    if (!editor) return;
    setInjectingId(template.id);
    try {
      await generateTemplateShapes(template, editor);
      clearSearch();
    } catch (e) {
      console.error(e);
      toast.error("Failed to inject template.");
    } finally {
      setInjectingId(null);
    }
  };

  const handleSelectShape = (shp: any) => {
    if (!editor) return;
    editor.run(() => {
      editor.setCurrentTool(shp.tool);
      if (shp.geo) {
        editor.setStyleForNextShapes(GeoShapeGeoStyle, shp.geo);
      }
    });
    clearSearch();
  };

  const handleInsertDevice = (deviceId: string) => {
    if (!editor) return;
    const viewportCenter = editor.getViewportPageBounds().center;
    let width = 400;
    let height = 300;

    switch (deviceId) {
      case "phone":
        width = 150;
        height = 320;
        break;
      case "tablet":
        width = 300;
        height = 400;
        break;
      case "desktop":
        width = 560;
        height = 360;
        break;
      case "browser":
        width = 480;
        height = 320;
        break;
      case "laptop":
        width = 520;
        height = 320;
        break;
      case "terminal":
        width = 420;
        height = 280;
        break;
    }

    editor.run(() => {
      const id = createShapeId();
      editor.createShapes([
        {
          id,
          type: "device-frame",
          x: viewportCenter.x - width / 2,
          y: viewportCenter.y - height / 2,
          props: {
            w: width,
            h: height,
            deviceType: deviceId,
          },
        },
      ]);
      editor.select(id);
    });
    clearSearch();
  };

  const handleFeatureClick = (feat: any) => {
    clearSearch();
    if (feat.type === "action") {
      if (feat.id === "figure") {
        const viewportCenter = editor.getViewportPageBounds().center;
        editor.run(() => {
          const id = createShapeId();
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
        });
      } else if (feat.id === "code-block") {
        const viewportCenter = editor.getViewportPageBounds().center;
        editor.run(() => {
          const id = createShapeId();
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
        });
      } else if (feat.id === "image") {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fileInput?.click();
      }
    } else {
      onNavigateToView(feat.id);
    }
  };

  const hasResults = useMemo(() => {
    return (
      searchResults.generalIcons.length > 0 ||
      searchResults.techLogos.length > 0 ||
      searchResults.awsIcons.length > 0 ||
      searchResults.gcpIcons.length > 0 ||
      searchResults.templates.length > 0 ||
      searchResults.shapes.length > 0 ||
      searchResults.devices.length > 0 ||
      searchResults.features.length > 0
    );
  }, [searchResults]);

  if (!hasResults) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        <Search className="h-8 w-8 text-muted-foreground/30 mb-2 stroke-[1.5]" />
        <p className="text-xs font-semibold text-foreground">No matches found</p>
        <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">
          Try searching for another cloud provider, logo, template name or icon keyword.
        </p>
      </div>
    );
  }

  // AWS count matching details
  const awsRemaining = Math.max(0, searchResults.awsIcons.length - 4);
  const gcpRemaining = Math.max(0, searchResults.gcpIcons.length - 4);

  return (
    <div className="flex-1 w-full bg-card overflow-y-auto">
      <div className="p-3.5 space-y-5 pb-8">
        {/* SECTION 2: General Icons */}
        {searchResults.generalIcons.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-muted-foreground/75 tracking-wider uppercase select-none">
              General Icons
            </h4>
            <div className="grid grid-cols-2 gap-2 w-full max-w-[260px] overflow-hidden">
              {searchResults.generalIcons.slice(0, 4).map((asset) => (
                <Button
                  key={asset.id}
                  variant="outline"
                  onClick={() => onIconClick(asset.id, asset.name)}
                  className="flex flex-col items-center gap-1.5 p-2 h-auto w-full min-w-0 bg-muted/10 hover:bg-accent border shadow-none select-none overflow-hidden"
                >
                  <Card className="h-8 w-8 flex items-center justify-center shrink-0 p-1 bg-background rounded border shadow-none">
                    <img width={100} height={100}
                      src={asset.path}
                      alt={asset.name}
                      className="h-full w-full object-contain"
                    />
                  </Card>
                  <span className="text-[9px] font-medium text-muted-foreground truncate w-full text-center block mt-0.5">
                    {asset.name}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: Shapes & Tools */}
        {searchResults.shapes.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-muted-foreground/75 tracking-wider uppercase select-none">
              Shapes & Tools
            </h4>
            <div className="grid grid-cols-2 gap-2 w-full max-w-[260px] overflow-hidden">
              {searchResults.shapes.map((shp) => {
                const IconComponent = SHAPE_ICONS[shp.iconName] || Square;
                return (
                  <Button
                    key={shp.id}
                    variant="outline"
                    onClick={() => handleSelectShape(shp)}
                    className="flex flex-col items-center gap-1.5 p-2 h-auto w-full min-w-0 bg-muted/10 hover:bg-accent border shadow-none select-none overflow-hidden"
                  >
                    <Card className="h-8 w-8 flex items-center justify-center shrink-0 p-1 bg-background rounded border shadow-none text-muted-foreground">
                      <IconComponent className="h-4 w-4 stroke-[1.5]" />
                    </Card>
                    <span className="text-[9px] font-medium text-muted-foreground truncate w-full text-center block mt-0.5">
                      {shp.label}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
        {/* SECTION: Device Mockups */}
        {searchResults.devices.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-muted-foreground/75 tracking-wider uppercase select-none">
              Device Mockups
            </h4>
            <div className="grid grid-cols-2 gap-2 w-full max-w-[260px] overflow-hidden">
              {searchResults.devices.map((dev) => {
                const IconComponent = SHAPE_ICONS[dev.iconName] || Smartphone;
                return (
                  <Button
                    key={dev.id}
                    variant="outline"
                    onClick={() => handleInsertDevice(dev.id)}
                    className="flex flex-col items-center gap-1.5 p-2 h-auto w-full min-w-0 bg-muted/10 hover:bg-accent border shadow-none select-none overflow-hidden"
                  >
                    <Card className="h-8 w-8 flex items-center justify-center shrink-0 p-1 bg-background rounded border shadow-none text-muted-foreground">
                      <IconComponent className="h-4 w-4 stroke-[1.5]" />
                    </Card>
                    <span className="text-[9px] font-medium text-muted-foreground truncate w-full text-center block mt-0.5">
                      {dev.label}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 3: Tech Logos */}
        {searchResults.techLogos.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-muted-foreground/75 tracking-wider uppercase select-none">
              Tech Logos
            </h4>
            <div className="grid grid-cols-2 gap-2 w-full max-w-[260px] overflow-hidden">
              {searchResults.techLogos.map((asset) => (
                <Button
                  key={asset.id}
                  variant="outline"
                  onClick={() => onIconClick(asset.id, asset.name)}
                  className="flex flex-col items-center gap-1.5 p-2 h-auto w-full min-w-0 bg-muted/10 hover:bg-accent border shadow-none select-none overflow-hidden"
                >
                  <Card className="h-8 w-8 flex items-center justify-center shrink-0 p-1 bg-background rounded border shadow-none">
                    <img width={100} height={100}
                      src={asset.path}
                      alt={asset.name}
                      className="h-full w-full object-contain"
                    />
                  </Card>
                  <span className="text-[9px] font-medium text-muted-foreground truncate w-full text-center block mt-0.5">
                    {asset.name}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: AWS Clouds */}
        {searchResults.awsIcons.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-muted-foreground/75 tracking-wider uppercase select-none">
              AWS
            </h4>
            <div className="grid grid-cols-2 gap-2 w-full max-w-[260px] overflow-hidden">
              {searchResults.awsIcons.slice(0, 4).map((asset) => (
                <Button
                  key={asset.id}
                  variant="outline"
                  onClick={() => onIconClick(asset.id, asset.name)}
                  className="flex flex-col items-center gap-1.5 p-2 h-auto w-full min-w-0 bg-muted/10 hover:bg-accent border shadow-none select-none overflow-hidden"
                >
                  <Card className="h-8 w-8 flex items-center justify-center shrink-0 p-1 bg-background rounded border shadow-none">
                    <img width={100} height={100}
                      src={asset.path}
                      alt={asset.name}
                      className="h-full w-full object-contain"
                    />
                  </Card>
                  <span className="text-[9px] font-medium text-muted-foreground truncate w-full text-center block mt-0.5">
                    {asset.name.replace(/^aws-/i, "")}
                  </span>
                </Button>
              ))}

              {awsRemaining > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => onNavigateToView("icons", "aws")}
                  className="flex flex-col items-center justify-center gap-0.5 p-2 h-auto w-full min-w-0 border hover:bg-accent select-none"
                >
                  <span className="text-xs font-bold text-primary">
                    +{awsRemaining}
                  </span>
                  <span className="text-[8px] font-extrabold text-primary uppercase tracking-tight">
                    more icons
                  </span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* SECTION 5: Google Clouds */}
        {searchResults.gcpIcons.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-muted-foreground/75 tracking-wider uppercase select-none">
              Google Cloud
            </h4>
            <div className="grid grid-cols-2 gap-2 w-full max-w-[260px] overflow-hidden">
              {searchResults.gcpIcons.slice(0, 4).map((asset) => (
                <Button
                  key={asset.id}
                  variant="outline"
                  onClick={() => onIconClick(asset.id, asset.name)}
                  className="flex flex-col items-center gap-1.5 p-2 h-auto w-full min-w-0 bg-muted/10 hover:bg-accent border shadow-none select-none overflow-hidden"
                >
                  <Card className="h-8 w-8 flex items-center justify-center shrink-0 p-1 bg-background rounded border shadow-none">
                    <img width={100} height={100}
                      src={asset.path}
                      alt={asset.name}
                      className="h-full w-full object-contain"
                    />
                  </Card>
                  <span className="text-[9px] font-medium text-muted-foreground truncate w-full text-center block mt-0.5">
                    {asset.name.replace(/^gcp-/i, "")}
                  </span>
                </Button>
              ))}

              {gcpRemaining > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => onNavigateToView("icons", "gcp")}
                  className="flex flex-col items-center justify-center gap-0.5 p-2 h-auto w-full min-w-0 border hover:bg-accent select-none"
                >
                  <span className="text-xs font-bold text-primary">
                    +{gcpRemaining}
                  </span>
                  <span className="text-[8px] font-extrabold text-primary uppercase tracking-tight">
                    more icons
                  </span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* SECTION 6: Templates Catalog */}
        {searchResults.templates.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-muted-foreground/75 tracking-wider uppercase select-none">
              Diagram Catalog
            </h4>
            <div className="space-y-2">
              {searchResults.templates.map((tpl) => (
                <Card
                  key={tpl.id}
                  onClick={() => handleTemplateInsert(tpl)}
                  className="flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer border shadow-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Card className="h-7 w-7 bg-background border flex items-center justify-center shrink-0 shadow-none rounded">
                      <Network className="h-3.5 w-3.5 text-muted-foreground" />
                    </Card>
                    <div className="flex flex-col items-start text-left min-w-0">
                      <span className="text-[11px] font-bold text-foreground truncate w-full block">
                        {tpl.name}
                      </span>
                      <span className="text-[9px] text-muted-foreground truncate w-full block mt-0.5">
                        {tpl.description}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 ml-2" />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 1: Features & Menu Links */}
        {searchResults.features.length > 0 && (
          <div className="space-y-2.5">
            <div className="space-y-2 w-full max-w-[260px] overflow-hidden">
              {searchResults.features.map((feat) => {
                const IconComponent = SHAPE_ICONS[feat.iconName] || Network;
                return (
                  <Card
                    key={feat.id}
                    onClick={() => handleFeatureClick(feat)}
                    className="p-3 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer flex items-center justify-between border shadow-none"
                  >
                    <div className="flex items-center gap-3">
                      <Card className="h-8 w-8 bg-background flex items-center justify-center border p-1 select-none shadow-none rounded text-muted-foreground">
                        <IconComponent className="h-4 w-4 stroke-[1.5]" />
                      </Card>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-foreground">
                          {feat.label}
                        </span>
                        <span className="text-[9px] text-muted-foreground mt-0.5 leading-none">
                          {feat.desc}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
