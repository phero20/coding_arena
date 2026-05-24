import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell } from "lucide-react";
import type { Track } from "@/services/queries/academy.queries";

interface TrackCardProps {
  track: Track;
}

export function TrackCard({ track }: TrackCardProps) {
  return (
    <Card className="group flex cursor-pointer flex-row items-center gap-6 overflow-hidden p-6 transition-all border-border bg-card duration-300 hover:border-primary/50 hover:shadow-md h-full">
      {/* Icon Side */}
      <div className="flex h-20 w-20 shrink-0 items-center justify-center">
        {/* Exercism icons typically include the hexagon. We use object-contain to fit it properly. */}
        <img
          src={track.icon_url}
          alt={`${track.title} icon`}
          className="h-full w-full object-contain"
          loading="lazy"
          title={track.title}
        />
      </div>

      {/* Content Side */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <h3 className="text-xl font-bold tracking-tight text-foreground truncate group-hover:text-primary">
          {track.title}
        </h3>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Dumbbell className="h-4 w-4 shrink-0" />
          <span className="truncate">{track.num_exercises} exercises</span>
        </div>

        {/* Tags */}
        <div className="mt-1 flex flex-wrap gap-2">
          {track.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-secondary/60 font-medium text-secondary-foreground hover:bg-secondary/80 truncate max-w-30"
            >
              {tag}
            </Badge>
          ))}
          {track.tags.length > 3 && (
            <span className="text-xs text-muted-foreground self-center ml-1 shrink-0 whitespace-nowrap">
              +{track.tags.length - 3} more
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
