import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function BentoCard({
  className,
  children,
  href,
}: {
  className?: string;
  children: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <Card
      className={cn(
        "group h-full overflow-hidden border-border/40 hover:border-border/70 transition-all duration-300 bg-card/30 backdrop-blur-sm",
        href && "cursor-pointer",
        className,
      )}
    >
      <CardContent className="p-0 h-full flex flex-col">{children}</CardContent>
    </Card>
  );
  if (href)
    return (
      <Link href={href} className="block h-full">
        {inner}
      </Link>
    );
  return inner;
}

export function CardHeader({
  icon: Icon,
  title,
  right,
}: {
  icon: React.ElementType;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="h-14 px-4 flex items-center justify-between border-b border-border/40 bg-card/10 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-2.5">
        <Icon className="size-4 text-muted-foreground" />
        <span className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
      </div>
      {right}
    </div>
  );
}
