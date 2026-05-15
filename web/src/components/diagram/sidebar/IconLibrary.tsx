import { useState, useMemo, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { DIAGRAM_ASSETS } from "@/constants/diagram-assets";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ───────────────────────────────────────────── */
/* Virtualized Icon Grid                         */
/* ───────────────────────────────────────────── */

/* sidebar is w-72 = 288px, minus 2*8px padding = 272px, 5 cols → each cell ~54px */
const COLS = 5;
const CELL_SIZE = 50; // px — icon button size
const CELL_GAP = 4;   // px — gap between cells
const ROW_HEIGHT = CELL_SIZE + CELL_GAP;
const GRID_PADDING = 8; // px each side

interface VirtualizedIconGridProps {
  assets: typeof DIAGRAM_ASSETS;
  onIconClick: (assetId: string, name: string) => void;
}

function VirtualizedIconGrid({
  assets,
  onIconClick,
}: VirtualizedIconGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => {
    const result: (typeof DIAGRAM_ASSETS)[] = [];
    for (let i = 0; i < assets.length; i += COLS) {
      result.push(assets.slice(i, i + COLS));
    }
    return result;
  }, [assets]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  if (assets.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">
            No icons match your search
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
    >
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() + GRID_PADDING }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const rowAssets = rows[virtualRow.index];
          return (
            <div
              key={virtualRow.index}
              className="absolute left-0 w-full"
              style={{
                top: virtualRow.start + GRID_PADDING,
                height: CELL_SIZE,
                display: "grid",
                gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
                gap: CELL_GAP,
                paddingLeft: GRID_PADDING,
                paddingRight: GRID_PADDING,
              }}
            >
              {rowAssets.map((asset) => (
                <Tooltip key={asset.id}>
                  <TooltipTrigger asChild>
                    <Button
                      style={{ width: CELL_SIZE, height: CELL_SIZE }}
                      className="flex items-center justify-center p-1.5 shrink-0"
                      variant="outline"
                      size="icon"
                      onClick={() => onIconClick(asset.id, asset.name)}
                    >
                      <img
                        src={asset.path}
                        alt={asset.name}
                        className="w-full h-full object-contain rounded"
                        draggable={false}
                        loading="lazy"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-wrap text-xs">{asset.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface IconLibraryProps {
  onIconClick: (assetId: string, name: string) => void;
}

export function IconLibrary({ onIconClick }: IconLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return DIAGRAM_ASSETS;
    const q = searchQuery.toLowerCase();
    return DIAGRAM_ASSETS.filter(
      (asset) =>
        asset.name.toLowerCase().includes(q) ||
        asset.id.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  return (
    <>
      <div className="p-3 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search icons..."
            className="h-9 pl-9 text-xs bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Separator />

      <div className="px-3 py-1.5 shrink-0 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {filteredAssets.length.toLocaleString()} results
        </span>
        {searchQuery && (
          <Button
            variant="secondary"
            size="sm"
            className="h-5 px-1.5 text-xs text-muted-foreground"
            onClick={() => setSearchQuery("")}
          >
            Clear
          </Button>
        )}
      </div>

      <VirtualizedIconGrid assets={filteredAssets} onIconClick={onIconClick} />
    </>
  );
}
