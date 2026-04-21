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
        "group h-full overflow-hidden border-border/60 hover:border-border transition-all duration-300 bg-card/30 backdrop-blur-sm ring-1 ring-border/30 shadow-[0_1px_0_hsl(var(--background)/0.6)_inset,0_0_0_1px_hsl(var(--border)/0.45),0_28px_60px_-26px_hsl(var(--foreground)/0.85),0_14px_30px_-16px_hsl(var(--foreground)/0.72)] hover:-translate-y-0.5 hover:ring-border/60 hover:shadow-[0_1px_0_hsl(var(--background)/0.72)_inset,0_0_0_1px_hsl(var(--border)/0.7),0_36px_72px_-28px_hsl(var(--foreground)/0.95),0_18px_38px_-18px_hsl(var(--foreground)/0.8)]",
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
