"use client";

import React from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserSearch } from "./UserSearch";

const Show = ({ when, children }: { when: "signed-in" | "signed-out"; children: React.ReactNode }) => {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return null;
  const isMatch = when === "signed-in" ? isSignedIn : !isSignedIn;
  return isMatch ? <>{children}</> : null;
};

export const NavbarActions = () => {
  const { user } = useUser();

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:block">
        <UserSearch />
      </div>
      <ModeToggle />
      
      <Show when="signed-out">
        <div className="flex items-center gap-3">
          <SignInButton mode="modal">
            <Button variant="ghost" className="text-sm font-semibold">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="text-sm font-bold shadow-md shadow-primary/20">
              Get Started
            </Button>
          </SignUpButton>
        </div>
      </Show>

      <Show when="signed-in">
        <div className="flex items-center gap-4">
          <Link 
            href={`/u/${user?.username || user?.id}`}
            className="group relative h-9 w-9 overflow-hidden rounded-xl border border-border/40 hover:border-primary/40 transition-all duration-300 active:scale-95 shadow-sm"
          >
            <Avatar className="h-full w-full rounded-none">
              <AvatarImage src={user?.imageUrl} alt={user?.username || "user"} />
              <AvatarFallback className="bg-primary/10 text-primary uppercase font-bold text-[10px]">
                {user?.username?.slice(0, 2) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </Show>
    </div>
  );
};
