"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useClerk } from "@clerk/nextjs";
import { LogOut, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useRoadmapStore } from "@/store/use-roadmap-store";
import { cn } from "@/lib/utils";
import { UserSearch } from "./UserSearch";

interface MobileMenuProps {
  navItems: { name: string; href: string; icon: any }[];
  pathname: string;
}

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

export const MobileMenu = ({ navItems, pathname }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { resetRoadmap } = useRoadmapStore();

  const handleSignOut = async () => {
    // 1. Purge all cached API data
    queryClient.clear();
    // 2. Reset UI state
    resetRoadmap();
    // 3. Perform Sign Out
    await signOut();
    router.push("/");
    setIsOpen(false);
  };

  return (
    <>
      <div className="flex items-center md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-foreground relative z-50 h-9 w-9 hover:bg-primary/5 transition-colors"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 bg-background border-b border-border md:hidden overflow-hidden z-50"
          >
            <div className="p-4 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
              {/* Search at the Top */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">
                  Search Users
                </span>
                <div className="w-full">
                  <UserSearch onSelect={() => setIsOpen(false)} />
                </div>
              </div>

              {/* User Profile Header (Signed In) */}
              <Show when="signed-in">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
                  <Link
                    href={`/u/${user?.username || user?.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-10 w-10 border border-border/40">
                      <AvatarImage src={user?.imageUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user?.username?.slice(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold truncate text-foreground">
                        {user?.fullName}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        {user?.username}
                      </span>
                    </div>
                  </Link>
                  <ModeToggle />
                </div>
              </Show>

              {/* Main Links */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-xl transition-all duration-200",
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4",
                          pathname === item.href
                            ? "text-primary"
                            : "text-muted-foreground/60",
                        )}
                      />
                      <span className="font-bold text-sm">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Auth Actions */}
              <div className="pt-4 border-t border-border/40 flex flex-col gap-3">
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <Button
                      variant="default"
                      className="w-full h-11 font-bold border-border/60"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                </Show>

                <Show when="signed-in">
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                    className="w-full h-11 justify-start gap-4 px-3 font-bold"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </Button>
                </Show>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
