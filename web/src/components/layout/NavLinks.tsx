"use client";

<<<<<<< HEAD
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
=======
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Swords,
  LayoutGrid,
  Cpu,
  Trophy,
  Mountain,
  Network,
  ChevronDown,
  GraduationCap
} from "lucide-react";

import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

export const navItems = [
  { name: "Academy", href: "/academy/tracks", icon: GraduationCap },
  { name: "Problems", href: "/problems", icon: LayoutGrid },
  { name: "Compilers", href: "/compilers", icon: Cpu },
  { name: "Arena", href: "/arena", icon: Swords },
  { name: "Contests", href: "/contests", icon: Trophy },
  { name: "Roadmap", href: "/roadmap", icon: Mountain },
  { name: "System Design", href: "/systemdesign", icon: Network },
>>>>>>> prod-deploy
];

export const NavLinks = () => {
  const pathname = usePathname();
<<<<<<< HEAD

  return (
    <div className="flex items-center gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
=======
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  const visibleItems = navItems.slice(0, 4); // Arena, Problems, Compilers, Contests, Roadmap
  const moreItems = navItems.slice(4); // System Design, etc.

  const isMoreActive = moreItems.some((item) => pathname.startsWith(item.href));

  return (
    <div className="flex items-center gap-2">
      {visibleItems.map((item) => {
        const isActive = pathname.startsWith(item.href);

>>>>>>> prod-deploy
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
<<<<<<< HEAD
              "px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {item.name}
          </Link>
        );
      })}
=======
              "relative px-4 py-2 flex items-center gap-2 text-sm font-semibold transition-colors rounded-md",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.name}

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

      {moreItems.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              variant="ghost"
              className={cn(
                "relative h-9 px-4 py-2 flex items-center gap-1 bg-transparent hover:bg-transparent text-muted-foreground hover:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none shadow-none",
                (open || isMoreActive) && "text-primary font-semibold",
              )}
            >
              More
              <ChevronDown
                className={cn(
                  "size-4 opacity-70 transition-transform",
                  open && "rotate-180",
                )}
              />
              {isMoreActive && (
                <motion.div
                  layoutId="navbar-active-border"
                  className="absolute left-0 right-0 bottom-0 h-[2px] bg-primary rounded-t-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            align="end"
            sideOffset={8}
            className="p-1 w-48 border-border bg-background"
          >
            <Command className="bg-transparent">
              <CommandList className="p-0">
                <CommandGroup>
                  {moreItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <CommandItem
                        key={item.href}
                        onSelect={() => {
                          router.push(item.href);
                          setOpen(false);
                        }}
                        className={cn(
                          "cursor-pointer px-3 py-3 text-sm font-semibold transition-colors",
                          "bg-transparent! hover:bg-transparent! data-[selected=true]:bg-transparent!",
                          isActive
                            ? "text-primary!"
                            : "text-muted-foreground! hover:text-foreground!",
                        )}
                      >
                        {item.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
>>>>>>> prod-deploy
    </div>
  );
};
