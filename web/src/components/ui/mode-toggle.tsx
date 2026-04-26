"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "next-themes";

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
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
    setOpen(false);
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
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="p-1 w-36 border-border bg-background overflow-hidden"
      >
        <Command className="bg-card/60">
          <CommandList>
            <CommandGroup>
              {[
                { name: "Light", value: "light", icon: Sun },
                { name: "Dark", value: "dark", icon: Moon },
                { name: "System", value: "system", icon: Monitor },
              ].map((item) => (
                <CommandItem
                  key={item.value}
                  onSelect={() => handleSetTheme(item.value)}
                  className="flex items-center gap-3 p-2 cursor-pointer rounded-md group"
                >
                  <div
                    className={cn(
                      "p-1 rounded-md transition-colors",
                      theme === item.value
                        ? "bg-primary/10 text-primary"
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
