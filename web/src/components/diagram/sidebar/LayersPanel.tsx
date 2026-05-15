import { Layers } from "lucide-react";

export function LayersPanel() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <Layers className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-xs text-muted-foreground">
          Layers panel coming soon.
        </p>
      </div>
    </div>
  );
}
