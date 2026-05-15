import { Plus } from "lucide-react";

interface ComingSoonPlaceholderProps {
  featureName: string;
}

export function ComingSoonPlaceholder({ featureName }: ComingSoonPlaceholderProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Plus className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium mb-1 capitalize">
        {featureName.replace(/-/g, " ")}
      </p>
      <p className="text-xs text-muted-foreground">
        This feature is coming soon.
      </p>
    </div>
  );
}
