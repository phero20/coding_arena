"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/shared/Container";
import { cn } from "@/lib/utils";
import { NavLinks, navItems } from "./NavLinks";
import { NavbarActions } from "./NavbarActions";
import { MobileMenu } from "./MobileMenu";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // List of paths where the Navbar should be hidden
  const HIDDEN_NAVBAR_PATHS = ["/problem/", "/arena/match", "/compiler"];

  const shouldHideNavbar = HIDDEN_NAVBAR_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  if (shouldHideNavbar) return null;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "py-3 bg-background/80 border-b border-border/40 backdrop-blur-xl"
          : "py-5 bg-transparent border-b border-transparent",
      )}
    >
      <Container className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            SlaveCode<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavLinks />
          <div className="h-4 w-[1px] bg-border/50 mx-2" />
          <NavbarActions />
        </div>

        {/* Mobile Menu & Toggle */}
        <MobileMenu navItems={navItems} pathname={pathname} />
      </Container>
    </nav>
  );
};
