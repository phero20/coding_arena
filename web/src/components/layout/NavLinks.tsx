"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Code2, 
  Swords, 
  Trophy, 
  Activity 
} from "lucide-react";

export const navItems = [
  { name: "Arena", href: "/arena", icon: Swords },
  { name: "Problems", href: "/problem", icon: Code2 },
  { name: "Compilers", href: "/compiler", icon: Trophy },
  { name: "Watch", href: "/watch", icon: Activity },
];

export const NavLinks = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};
