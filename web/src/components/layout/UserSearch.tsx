"use client";

import React, { useState } from "react";
import { ArrowRight, Loader2, Search, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserSearchQuery } from "@/hooks/queries/use-user-search.queries";
import { useDebounce } from "@/hooks/shared/use-debounce";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";

interface UserSearchProps {
  onSelect?: () => void;
}

export const UserSearch = ({ onSelect }: UserSearchProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const { data: results, isLoading } = useUserSearchQuery(debouncedQuery);
  const router = useRouter();

  const handleSelectUser = (username: string) => {
    router.push(`/u/${username}`);
    setOpen(false);
    setQuery("");
    onSelect?.();
  };

  return (
    <div className="relative w-full md:w-84">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative group cursor-pointer w-full">
            <Search
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10 transition-colors",
                open
                  ? "text-primary"
                  : "text-muted-foreground/50 group-hover:text-muted-foreground",
              )}
            />
            <Input
              readOnly
              placeholder="Search users..."
              value={query}
              className="pl-9 cursor-pointer bg-muted/40 border-transparent hover:bg-muted/60 hover:border-border/40 transition-all truncate"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="p-1 w-84 border-border bg-background"
          align="start"
          sideOffset={8}
        >
          <Command shouldFilter={false} className="bg-card/60">
            <CommandInput
              placeholder="Search by name or username..."
              value={query}
              onValueChange={setQuery}
              className="h-10 border-none focus:ring-0"
              autoFocus
            />
            <CommandList className="max-h-[300px] custom-scrollbar">
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}

              {!isLoading && results && results.length > 0 && (
                <CommandGroup heading="Users">
                  {results.map((user) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => handleSelectUser(user.username)}
                      className="flex items-center gap-3 p-2 cursor-pointer"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl || ""} />
                        <AvatarFallback className="bg-muted text-[10px] uppercase font-bold text-muted-foreground">
                          {user.username.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="text-sm font-bold truncate">
                          {user.fullName || user.username}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {user.username}
                        </span>
                      </div>
                      <Button variant="link">
                        <ArrowRight className="-rotate-45" />
                      </Button>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {!isLoading &&
                query.trim() !== "" &&
                (!results || results.length === 0) && (
                  <CommandEmpty className="py-10 flex flex-col items-center gap-2 text-muted-foreground/40">
                    <UserIcon className="h-5 w-5 opacity-20" />
                    <span className="text-xs font-medium">No users found</span>
                  </CommandEmpty>
                )}

              {query.trim() === "" && (
                <div className="py-6 text-center text-[10px] uppercase tracking-widest font-medium text-muted-foreground/40">
                  Type to search...
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
