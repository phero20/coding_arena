"use client";

import * as React from "react";
import { Moon, Sun, Check, Zap, Terminal, Palette, Settings2, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);

  const DEFAULT_THEMES = [
    { name: "Lime Dark", value: "dark", icon: Palette },
    { name: "Neutral Zinc", value: "theme-neutral", icon: Palette },
    { name: "Bubble Gum", value: "theme-bubble-gum", icon: Palette },
  ];

  const EXTRA_THEMES = [
    { name: "Twitter Dark", value: "theme-twitter", icon: Palette },
    { name: "Claude Warm", value: "theme-claude", icon: Palette },
    { name: "Astro Vista", value: "theme-astro-vista", icon: Palette },
    { name: "Chalk", value: "theme-chalk", icon: Palette },
    { name: "Sandstone", value: "theme-sandstone", icon: Palette },
    { name: "Cyber Yellow", value: "theme-cyber-yellow", icon: Palette },
  ];

  const allKnownThemes = [...DEFAULT_THEMES, ...EXTRA_THEMES];
  
  const currentThemeData = allKnownThemes.find((opt) => opt.value === theme) || 
    { name: "Custom", value: theme || "dark", icon: Palette };

  // Only show the active theme if it's NOT in the default list
  const isDefaultTheme = DEFAULT_THEMES.some(t => t.value === theme);
  const themeOptions = isDefaultTheme 
    ? DEFAULT_THEMES 
    : [...DEFAULT_THEMES, currentThemeData];

  const handleSetTheme = (newTheme: string) => {
    // Fallback for browsers that don't support View Transitions
    if (!(document as any).startViewTransition) {
      setTheme(newTheme);
      setOpen(false);
      return;
    }

    document.documentElement.classList.add("transitioning-theme");

    const transition = (document as any).startViewTransition(() => {
      setTheme(newTheme);
      setOpen(false);
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove("transitioning-theme");
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-9 w-9 rounded-full border transition-all duration-300",
            open
              ? "border-primary/40 bg-muted"
              : "border-border hover:border-primary/40",
          )}
        >
          <currentThemeData.icon className="size-[1.2rem] text-primary relative z-10" />
          <span className="sr-only">
            Toggle theme (Current: {currentThemeData.name})
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="p-1 w-52 border-border bg-background overflow-hidden"
      >
        <Command className="bg-card/60">
          <CommandList>
            <CommandGroup heading="Tactical Skins">
              {themeOptions.map((item) => (
                <CommandItem
                  key={item.value}
                  onSelect={() => handleSetTheme(item.value)}
                  className="flex items-center gap-3 p-2 cursor-pointer rounded-md group"
                >
                  <div
                    className={cn(
                      "p-1 rounded-md transition-colors",
                      theme === item.value
                        ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]"
                        : "bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary",
                    )}
                  >
                    <item.icon size={14} />
                  </div>
                  <span
                    className={cn(
                      "flex-1 text-sm font-semibold",
                      theme === item.value
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.name}
                  </span>
                  {theme === item.value && (
                    <Check
                      size={12}
                      className="text-primary animate-in zoom-in duration-300"
                    />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator className="my-1 opacity-50" />
            <CommandGroup>
              <Link href="/settings?tab=appearance" onClick={() => setOpen(false)}>
                <CommandItem className="flex items-center gap-3 p-2 cursor-pointer rounded-md group">
                  <div className="p-1 rounded-md bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Settings2 size={14} />
                  </div>
                  <span className="flex-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    Explore more themes
                  </span>
                  <ArrowRight
                    size={12}
                    className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                  />
                </CommandItem>
              </Link>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
