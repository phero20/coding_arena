"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const navItems = [
  { name: "Dashboard", href: "/" },
  { 
    name: "Academy", 
    href: "/academy",
    subpages: [
      { name: "Tracks", href: "/academy/tracks" },
      { name: "Configs", href: "/academy/configs" },
      { name: "Concepts", href: "/academy/concepts" },
      { name: "Exercises", href: "/academy/exercises" },
    ]
  },
  { name: "Roadmap", href: "/roadmap" },
  { name: "System Design", href: "/systemdesign" },
  { 
    name: "Problems", 
    href: "/problems",
    subpages: [
      { name: "All Problems", href: "/problems" },
      { name: "Tags & Categories", href: "/problems/tags" },
    ]
  },
  { 
    name: "Users", 
    href: "/users",
    subpages: [
      { name: "All Users", href: "/users" },
      { name: "Roles & Permissions", href: "/users/roles" },
    ]
  },
  { 
    name: "Submissions", 
    href: "/submissions",
    subpages: [
      { name: "All Submissions", href: "/submissions" },
      { name: "Pending Verification", href: "/submissions/pending" },
    ]
  },
  { 
    name: "Database", 
    href: "/database",
    subpages: [
      { name: "Overview", href: "/database" },
      { name: "Backups", href: "/database/backups" },
    ]
  },
];

export const NavLinks = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-4">
      {navItems.map((item) => {
        const isActive = item.href === "/" 
          ? pathname === "/" 
          : pathname.startsWith(item.href);

        if (item.subpages) {
          return (
            <DropdownMenu key={item.href}>
              <DropdownMenuTrigger
                className={cn(
                  "flex items-center gap-1 px-2 py-1.5 text-sm font-medium transition-colors outline-none  cursor-pointer",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.name}
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {item.subpages.map((subpage) => (
                  <DropdownMenuItem key={subpage.href} asChild>
                    <Link
                      href={subpage.href}
                      className={cn(
                        "w-full cursor-pointer rounded-sm px-2 py-1.5 text-sm transition-colors",
                        pathname === subpage.href 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "hover:bg-muted"
                      )}
                    >
                      {subpage.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-2 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};
