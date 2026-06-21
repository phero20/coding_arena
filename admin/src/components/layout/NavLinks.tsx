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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
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
    ],
  },
  { name: "Roadmap", href: "/roadmap" },
  { name: "Problems", href: "/problems" },
  { 
    name: "System Design", 
    href: "/systemdesign",
    subpages: [
      { name: "Topics", href: "/systemdesign" },
      { name: "Workspaces", href: "/systemdesign/workspaces" },
      { name: "Diagrams", href: "/systemdesign/diagrams" },
    ],
  },
  { name: "Companies", href: "/companies" },

  {
    name: "Contests",
    href: "/contests",
  },
  {
    name: "Users",
    href: "/users",
    subpages: [
      { name: "All Users", href: "/users/all-users" },
      { name: "Users Stats", href: "/users/stats" },
      { name: "User Activity", href: "/users/activity" },
      { name: "Solved Problems", href: "/users/solved-problems" },
      { name: "Academy Exercises", href: "/users/academy-exercises" },
      { name: "Solved Languages", href: "/users/solved-languages" },
      { name: "Code Solutions", href: "/users/solutions" },
    ],
  },
  {
    name: "Report Bug",
    href: "/report-bug",
  },
  {
    name: "System Cache",
    href: "/cache",
  },
];

export const NavLinks = () => {
  const pathname = usePathname();

  const visibleItems = navItems.slice(0, 6);
  const moreItems = navItems.slice(6);

  const isMoreActive = moreItems.some((item) => pathname.startsWith(item.href));

  return (
    <div className="flex items-center gap-4">
      {visibleItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        if (item.subpages) {
          return (
            <DropdownMenu key={item.href}>
              <DropdownMenuTrigger
                className={cn(
                  "flex items-center gap-1 px-2 py-1.5 text-sm font-medium transition-colors outline-none cursor-pointer rounded-md",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary",
                )}
              >
                {item.name}
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-1">
                {item.subpages.map((subpage) => (
                  <DropdownMenuItem
                    key={subpage.href}
                    asChild
                    className="hover:bg-transparent! hover:text-primary! focus:bg-transparent! focus:text-primary!"
                  >
                    <Link
                      href={subpage.href}
                      className={cn(
                        "w-full cursor-pointer rounded-sm px-3 py-3 text-sm font-semibold transition-colors mb-0.5 last:mb-0",
                        pathname === subpage.href
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary",
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
              "px-2 py-1.5 text-sm font-medium transition-colors rounded-md",
              isActive
                ? "text-primary "
                : "text-muted-foreground hover:text-primary",
            )}
          >
            {item.name}
          </Link>
        );
      })}

      {moreItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 text-sm font-medium transition-colors outline-none cursor-pointer rounded-md",
              isMoreActive
                ? "text-primary"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            More
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 p-1">
            {moreItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              if (item.subpages) {
                return (
                  <DropdownMenuSub key={item.href}>
                    <DropdownMenuSubTrigger
                      className={cn(
                        "w-full cursor-pointer rounded-sm px-3 py-3 text-sm font-semibold transition-colors mb-0.5 last:mb-0 hover:bg-transparent! hover:text-primary! focus:bg-transparent! focus:text-primary! data-[state=open]:bg-transparent! data-[state=open]:text-primary!",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary",
                      )}
                    >
                      {item.name}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-56 p-1 ">
                        {item.subpages.map((subpage) => (
                          <DropdownMenuItem
                            key={subpage.href}
                            asChild
                            className="hover:bg-transparent! hover:text-primary! focus:bg-transparent! focus:text-primary!"
                          >
                            <Link
                              href={subpage.href}
                              className={cn(
                                "w-full cursor-pointer rounded-sm px-3 py-3 text-sm font-semibold transition-colors mb-0.5 last:mb-0",
                                pathname === subpage.href
                                  ? "text-primary"
                                  : "text-muted-foreground hover:text-primary",
                              )}
                            >
                              {subpage.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                );
              }

              return (
                <DropdownMenuItem key={item.href} asChild className="hover:bg-transparent! hover:text-primary! focus:bg-transparent! focus:text-primary!">
                  <Link
                    href={item.href}
                    className={cn(
                      "w-full cursor-pointer rounded-sm px-3 py-3 text-sm font-semibold transition-colors mb-0.5 last:mb-0",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
