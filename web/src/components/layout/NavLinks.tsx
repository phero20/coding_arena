"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Code2, 
  Swords, 
  Trophy, 
  Activity 
} from "lucide-react";

export const navItems = [
  { name: "Arena", href: "/arena", icon: Swords },
  { name: "Practice", href: "/problem", icon: Code2 },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Watch", href: "/watch", icon: Activity },
];

export const NavLinks = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-primary"
              : "text-muted-foreground",
          )}
        >
          {item.name}
          {pathname === item.href && (
            <motion.div
              layoutId="nav-underline"
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full mx-4"
            />
          )}
        </Link>
      ))}
    </div>
  );
};
