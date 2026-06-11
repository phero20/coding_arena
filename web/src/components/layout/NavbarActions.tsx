"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton, useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { LogOut, ChevronRight, User, BarChart2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useRoadmapStore } from "@/store/use-roadmap-store";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";


export const NavbarActions = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { resetRoadmap } = useRoadmapStore();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    // 1. Purge all cached API data
    queryClient.clear();
    // 2. Reset UI state
    resetRoadmap();
    // 3. Perform Sign Out and Redirect
    await signOut({ redirectUrl: "/" });
  };

  const username = user?.username || user?.id;
  const handleAction = (pathOrAction: string | (() => void)) => {
    setOpen(false);
    if (typeof pathOrAction === "string") {
      router.push(pathOrAction);
    } else {
      pathOrAction();
    }
  };

  return (
    <div className="flex items-center gap-4">

      <ModeToggle />

      {!isLoaded && (
        <div className="h-9 w-9 rounded-full bg-card/80 animate-pulse border border-border/40" />
      )}

      {isLoaded && !isSignedIn && (
        <div className="flex items-center gap-3">
          <SignInButton mode="modal">
            <Button className="text-sm font-medium px-2 md:px-4">
              <LogIn className="size-4 " />
              <span className="hidden lg:inline">Sign in</span>
            </Button>
          </SignInButton>
        </div>
      )}

      {isLoaded && isSignedIn && (
        <div className="flex items-center gap-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                className={cn(
                  "relative h-9 w-9 rounded-full bg-transparent border transition-all duration-300 active:scale-95",
                  open
                    ? "border-primary/40 bg-muted"
                    : "border-border/40 hover:border-primary/40",
                )}
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src={user?.imageUrl}
                    alt={user?.fullName || "user"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary uppercase font-bold text-xs">
                    {user?.fullName?.slice(0, 2) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="p-1 w-50 border-border bg-background overflow-hidden"
            >
              <Command className="bg-card/60">
                <Link
                  href={`/u/${username}`}
                  className="flex flex-col px-3 py-2 border-b border-border/40 bg-muted/20"
                >
                  <span className="text-sm font-bold truncate text-foreground">
                    {user?.fullName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user?.username}
                  </span>
                </Link>

                <CommandList className="p-1 custom-scrollbar">
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => handleAction(`/u/${username}`)}
                      className="flex items-center gap-3 p-1.5 cursor-pointer  group"
                    >
                      <Badge variant={"outline"} className="p-1.5 group-hover:bg-card transition-colors">
                        <User size={12} className="text-primary" />
                      </Badge>
                      <span className="flex-1 font-semibold text-sm">
                        Profile
                      </span>
                      <ChevronRight
                        size={12}
                        className="text-muted-foreground/80 group-hover:text-primary/50 transition-colors"
                      />
                    </CommandItem>

                    <CommandItem
                      onSelect={() => handleAction("/leaderboard")}
                      className="flex items-center gap-3 p-1.5 cursor-pointer  group mt-1"
                    >
                       <Badge variant={"outline"} className="p-1.5 group-hover:bg-card transition-colors">
                        <BarChart2 size={12} className="text-primary" />
                      </Badge>
                      <span className="flex-1 font-semibold text-sm">
                        Leaderboard
                      </span>
                      <ChevronRight
                        size={12}
                        className="text-muted-foreground/80 group-hover:text-primary/50 transition-colors"
                      />
                    </CommandItem>
                  </CommandGroup>

                  <CommandSeparator className="my-1 bg-border/60" />

                  <CommandGroup>
                    <CommandItem
                      onSelect={() => handleAction(handleSignOut)}
                      className="flex items-center gap-3 p-1.5 cursor-pointer group text-destructive"
                    >
                     <Badge variant={"outline"} className="p-1.5 group-hover:bg-card transition-colors">
                        <LogOut size={8} className="text-destructive" />
                      </Badge>
                      <span className="flex-1 font-semibold text-sm">
                        Sign out
                      </span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};
