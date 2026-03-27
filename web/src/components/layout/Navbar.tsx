"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Swords,
  Trophy,
  Activity,
  MessageSquare,
  Menu,
  X,
  Rocket,
} from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
  Show,
} from "@clerk/nextjs";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Arena", href: "/arena", icon: Swords },
  { name: "Practice", href: "/practice", icon: Code2 },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Watch", href: "/watch", icon: Activity },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
        scrolled
          ? "py-3 bg-background/80 border-b border-border/40 backdrop-blur-xl"
          : "py-5 bg-transparent border-b border-transparent",
      )}
    >
      <Container className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-primary text-primary-foreground transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary/20">
            <Rocket className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tighter sm:text-2xl italic">
            CODING<span className="text-primary">ARENA</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {item.name}
                {pathname === item.href && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full mx-4"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-border/50 mx-2" />

          <div className="flex items-center gap-4">
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
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="font-semibold">
                    Dashboard
                  </Button>
                </Link>
                <UserButton />
              </div>
            </Show>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground"
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </Container>

      {/* Mobile Menu */}
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
                <Show when="signed-in">
                  <Link href="/dashboard" className="w-full">
                    <Button className="w-full">My Dashboard</Button>
                  </Link>
                </Show>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
