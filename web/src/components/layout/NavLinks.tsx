"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Swords, 
  LayoutGrid, 
  Cpu, 
  Trophy, 
  Mountain 
} from "lucide-react";

import { motion } from "framer-motion";

export const navItems = [
  { name: "Arena", href: "/arena", icon: Swords },
  { name: "Problems", href: "/problems", icon: LayoutGrid },
  { name: "Compilers", href: "/compilers", icon: Cpu },
  { name: "Contests", href: "/contests", icon: Trophy },
  { name: "Roadmap", href: "/roadmap", icon: Mountain },
];

export const NavLinks = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      {navItems.map((item) => {
        // Use startsWith to keep it active even on sub-pages (like /problems/123)
        // Except for arena which might be exact, but startsWith is usually fine.
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative px-4 py-2 flex items-center gap-2 text-sm font-semibold transition-colors rounded-md",
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {/* <Icon className="w-4 h-4" /> */}
            {item.name}
            
            {/* The gliding active bottom border */}
            {isActive && (
              <motion.div
                layoutId="navbar-active-border"
                className="absolute left-0 right-0 bottom-0 h-[2px] bg-primary rounded-t-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
};
