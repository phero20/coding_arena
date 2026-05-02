"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SignInButton, useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserSearch } from "./UserSearch";
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
import { User, LogOut, LayoutDashboard, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const Show = ({
  when,
  children,
}: {
  when: "signed-in" | "signed-out";
  children: React.ReactNode;
}) => {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return null;
  const isMatch = when === "signed-in" ? isSignedIn : !isSignedIn;
  return isMatch ? <>{children}</> : null;
};

export const NavbarActions = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
      {/* <div className="hidden md:block">
        <UserSearch />
      </div> */}
      <ModeToggle />

      <Show when="signed-out">
        <div className="flex items-center gap-3">
          <SignInButton mode="modal">
            <Button className="text-sm font-medium">Sign in</Button>
          </SignInButton>
        </div>
      </Show>

      <Show when="signed-in">
        <div className="flex items-center gap-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "relative h-9 w-9 rounded-full border transition-all duration-300 active:scale-95",
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
                      className="flex items-center gap-3 p-1.5 cursor-pointer rounded-lg group"
                    >
                      <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <User size={8} className="text-primary" />
                      </div>
                      <span className="flex-1 font-semibold text-sm">
                        Profile
                      </span>
                      <ChevronRight
                        size={8}
                        className="text-muted-foreground/80 group-hover:text-primary/50 transition-colors"
                      />
                    </CommandItem>
                  </CommandGroup>

                  <CommandSeparator className="my-1 bg-border/40" />

                  <CommandGroup>
                    <CommandItem
                      onSelect={() =>
                        handleAction(() => signOut(() => router.push("/")))
                      }
                      className="flex items-center gap-3 p-1.5 cursor-pointer rounded-lg group text-destructive hover:bg-destructive"
                    >
                      <div className="p-1.5 rounded-md bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                        <LogOut size={8} className="text-destructive" />
                      </div>
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
      </Show>
    </div>
  );
};
