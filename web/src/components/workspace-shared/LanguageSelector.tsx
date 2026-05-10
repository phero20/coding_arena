"use client";

import React, { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Terminal } from "lucide-react";
import type { LanguageSelectorProps, LanguageOption } from "@/types/component.types";
import { cn } from "@/lib/utils";

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  languages,
}) => {
  const [open, setOpen] = useState(false);

  const selectedLanguage = languages.find((lang) => lang.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-8 w-[140px] justify-between bg-muted/40 border-border/40 text-[11px] font-bold hover:bg-muted/60"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Terminal className="size-3 text-primary shrink-0" />
            <span className="truncate">
              {selectedLanguage ? selectedLanguage.name : "Select language..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-1 size-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="w-[280px] sm:w-[300px] p-0 bg-card/95 backdrop-blur-xl border-border/40"
      >
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search language..."
            className="h-9 text-[11px]"
          />
          <CommandList className="max-h-[40vh] sm:max-h-[300px] overflow-y-auto custom-scrollbar">
            <CommandEmpty className="text-[11px] py-6 text-center text-muted-foreground">
              No language found.
            </CommandEmpty>
            <CommandGroup className="p-2">
              <div className="grid grid-cols-2 gap-1">
                {languages.map((lang) => (
                  <CommandItem
                    key={lang.id}
                    value={lang.id}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? value : currentValue);
                      setOpen(false);
                    }}
                    className={`text-[11px] font-medium py-2 cursor-pointer focus:bg-primary/20 focus:text-primary aria-selected:bg-primary/20 aria-selected:text-primary flex items-center justify-between ${value === lang.id ? "bg-primary/20 text-primary" : ""}`}
                  >
                    <span className="truncate">{lang.name}</span>
                    <Check
                      className={cn(
                        "ml-auto size-3 shrink-0",
                        value === lang.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
