"use client";

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
  ChevronRight,
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
  { name: "Arena", href: "/arena", icon: Swords },
  { name: "Problems", href: "/problems", icon: LayoutGrid },
  { name: "Compilers", href: "/compilers", icon: Cpu },
  { name: "Contests", href: "/contests", icon: Trophy },
  { name: "Roadmap", href: "/roadmap", icon: Mountain },
  { name: "System Design", href: "/system-design", icon: Network },
];

export const NavLinks = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const visibleItems = navItems.slice(0, 4); // Arena, Problems, Compilers, Contests, Roadmap
  const moreItems = navItems.slice(4); // System Design, etc.

  const isMoreActive = moreItems.some((item) => pathname.startsWith(item.href));

  return (
    <div className="flex items-center gap-2">
      {visibleItems.map((item) => {
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
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
              variant="ghost"
              className={cn(
                "relative h-9 px-4 py-2 flex items-center gap-1 bg-transparent hover:bg-transparent text-muted-foreground hover:text-foreground",
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
                          "!bg-transparent hover:!bg-transparent data-[selected=true]:!bg-transparent",
                          isActive
                            ? "!text-primary"
                            : "!text-muted-foreground hover:!text-foreground",
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
    </div>
  );
};
