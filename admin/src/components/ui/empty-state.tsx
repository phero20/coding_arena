import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div className={cn("py-6 text-center text-muted-foreground border rounded-md", className)}>
      {message}
    </div>
  );
}
