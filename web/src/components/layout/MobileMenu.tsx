"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface MobileMenuProps {
  navItems: { name: string; href: string; icon: any }[];
  pathname: string;
}

const Show = ({ when, children }: { when: "signed-in" | "signed-out"; children: React.ReactNode }) => {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return null;
  const isMatch = when === "signed-in" ? isSignedIn : !isSignedIn;
  return isMatch ? <>{children}</> : null;
};

export const MobileMenu = ({ navItems, pathname }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-4 md:hidden">
        <ModeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-foreground"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-background/95 border-b border-border backdrop-blur-xl md:hidden overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-semibold">{item.name}</span>
                </Link>
              ))}
              <div className="pt-4 border-t border-border flex flex-col gap-3">
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="w-full">Get Started</Button>
                  </SignUpButton>
                </Show>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
