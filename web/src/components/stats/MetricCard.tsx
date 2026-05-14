"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  delay?: number;
}

/**
 * MetricCard redesigned for a clean, architectural look.
 * Removal of blurs and glows in favor of solid borders and clear typography.
 */
export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  className, 
  iconClassName,
  delay = 0 
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "p-6 border border-border/50 bg-card rounded-xl flex items-start gap-4",
        className
      )}
    >
      <div className={cn("p-3 rounded-lg bg-muted border border-border/20", iconClassName)}>
        <Icon size={20} />
      </div>
      
      <div className="space-y-1">
        <h3 className="text-[10px] uppercase text-muted-foreground">
          {title}
        </h3>
        <p className="text-3xl font-semibold leading-none">
          {value}
        </p>
        <p className="text-[10px] text-muted-foreground uppercase leading-normal">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
